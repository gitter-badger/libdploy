var fs        = require('fs'),
    path      = require('path'),
    util      = require('util'),
    promisify = require('es6-promisify'),
    Git       = require('nodegit'),
    GitHelper = require('nodegit-helper'),
    Role      = require('./role.js'),
    YAMLFile  = require('./utils/yamlfile.js'),
    rename    = promisify(fs.rename);

var HOSTNAME_REGEX = new RegExp(
    '^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*' +
    '([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])$');

// @complexity O(n)
function lookupRoleIndex(roles, role) {
    var found = -1;

    roles.forEach(function(item, index) {
        if ((typeof item === 'string' && path.dirname(item) === role) ||
            (typeof item === 'object' && path.dirname(item.role) === role)) {
            found = index;
        }
    });

    return found;
}

/**
 * Object which represents a Host. It's a container which contains roles,
 * variables and configuration about a host.
 * @constructor
 * @param {Cluster} cluster - Cluster of this host.
 * @param {string} file - Playbook file path of this host.
 */
function Host(cluster, file) {
    this.cluster = cluster;

    YAMLFile.call(this, file);
}

// Inherits YAMLFile
util.inherits(Host, YAMLFile);

/**
 * Validate hostname.
 * @param {string} hostname - Hostname to validate.
 * @return {boolean} True if hostname is valid, even false.
 */
Host.validate = function(hostname) {
    return HOSTNAME_REGEX.test(hostname);
};

/**
 * Get playbook path of this host.
 * @return {string} Playbook path.
 */
Host.prototype.path = function() {
    return this.file;
};

/**
 * Get name of this host.
 * @return {string} Hostname.
 */
Host.prototype.name = function() {
    return path.basename(this.file, '.yml');
};

/**
 * Rename this host. It will NOT rename the reference to it in cluster.
 * @access protected (MUST only be used by Cluster#renameHost)
 * @param {string} newname - New name of this host.
 * @return {Promise}
 */
Host.prototype.rename = function(newname) {
    var self = this,
        abs  = path.join(path.dirname(self.file), newname + '.yml'),
        dir  = self.cluster.path();

    // Rename the file itself
    return rename(self.file, abs)

    // Remove previous file in Git repository
    .then(function() {
        return Git.Repository.open(dir);
    })
    .then(function(repo) {
        return GitHelper.removeFile(repo, path.relative(dir, self.file));
    })

    // Rename `hosts` reference in it
    .then(function() {
        self.file = abs;
        return self.read();
    })
    .then(function(config) {
        config[0].hosts = newname;
        return self.write(config);
    });
};

/**
 * Initialize this host. It will overwrite the playbook with an empty
 * configuration.
 * @return {Promise}
 */
Host.prototype.initialize = function() {
    var self = this;

    return self.cluster.atomic(function () {

        // Initialize configuration file
        return self.write([{
            hosts: self.name(),
            roles: [],
            vars: {},
        }])

        .then(function() {
            return self.commit('cluster.host.create');
        });

    });
};

/**
 * Read variables of this host.
 * @return {Promise} Object within a Promise.
 */
Host.prototype.variables = function() {
    return this.read()
    .then(function(config) {
        return config[0].vars;
    });
};

/**
 * Set host variables.
 * @param {object} variables - Variables of this host.
 * @return {Promise}
 */
Host.prototype.setVariables = function(variables) {
    var self = this;

    return self.cluster.atomic(function () {

        return self.read()

        .then(function(config) {
            config[0].vars = variables;
            return self.write(config);
        })

        .then(function() {
            return self.commit('cluster.host.variables');
        });

    });
};

/**
 * Activate a role for this host. It's going with a parameter set which is
 * validate with role schema.
 * @param {Role} role - Role to activate.
 * @param {string} version - Version to use.
 * @param {object} params - Parameter set.
 * @return {Promise}
 */
Host.prototype.setRole = function(role, version, params) {
    var self = this;

    if (typeof params !== 'object') {
        return Promise.reject('Illegal argument exception `params`');
    }

    if (! (role instanceof Role)) {
        return Promise.reject('Illegal argument exception `role`');
    }

    // TODO validate role parameter set

    // Set role name in parameters
    params.role = path.join(role.name(), version);

    return self.cluster.atomic(function () {

        // Add role reference in configuration
        return self.read()

        .then(function(config) {
            // Check config object
            if (! (config[0].roles instanceof Array)) {
                // NOTE do we have to log that ?
                config[0].roles = [];
            }

            // Look at index of role
            var index = lookupRoleIndex(config[0].roles, role.name());

            // Add or set role config
            if (index === -1) {
                config[0].roles.push(params);
            } else {
                config[0].roles[index] = params;
            }

            return self.write(config);
        })

        .then(function() {
            return self.commit('cluster.host.roles');
        });

    });
};

/**
 * Deactivate a role for this host.
 * @param {Role} role - Role to deactivate.
 * @return {Promise}
 */
Host.prototype.unsetRole = function(role) {
    var self = this;

    return self.cluster.lock()

    // Remove role reference in configuration
    .then(function() {
        return self.read();
    })
    .then(function(config) {
        // Check config object
        if (! (config[0].roles instanceof Array)) {
            // NOTE do we have to log that ?
            config[0].roles = [];
        }

        // Look at index of role
        var index = lookupRoleIndex(config[0].roles, role.name());
        if (index === -1) {
            return Promise.reject('Role is not set');
        }

        // Remove role from config
        config[0].roles.splice(index, 1);

        // Write config
        return self.write(config);
    })

    .then(function() {
        return self.commit('cluster.host.roles');
    })

    .then(function() {
        return self.cluster.unlock();
    });
};

/**
 * Commit changes made in this Host configuration.
 * @access private
 * @param {string} comment - A comment for the commit.
 * @return {Promise}
 */
Host.prototype.commit = function(comment) {
    var self = this,
        dir  = self.cluster.path(),
        repo;

    return Git.Repository.open(dir)
    .then(function(_repo) {
        repo = _repo;
        return GitHelper.addFile(repo, path.relative(dir, self.path()));
    })
    .then(function() {
        return GitHelper.commit(repo, null, comment);
    });
};

module.exports = Host;
