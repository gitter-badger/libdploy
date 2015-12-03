var YAMLFile = require('./yamlfile.js'),
    util     = require('util'),
    path     = require('path'),
    Role     = require('./role.js'),
    Git       = require('nodegit'),
    GitHelper = require('./githelper.js');

var HOSTNAME_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/

module.exports = Host;

/**
 * Object which represents a Host. It's a container which contains roles,
 * variables and configuration about a host.
 * @constructor
 * @param {string} file - Playbook file path of this host.
 */
function Host(file) {
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
 * Initialize this host. It will overwrite the playbook with an empty
 * configuration.
 * @return {Promise}
 */
Host.prototype.initialize = function() {
    var self = this;

    // Initialize configuration file
    return self.write([{
        hosts: self.name(),
        roles: [],
        vars: {},
    }])

    .then(function() {
        return self.commit('cluster.host.create');
    });
};

/**
 * Read variables of this host.
 * @return {Promise} Object within a Promise.
 */
Host.prototype.variables = function() {
    return this.read()
    .then(function(config) {
        return Promise.resolve(config[0].vars);
    });
};

/**
 * Set host variables.
 * @param {object} variables - Variables of this host.
 * @return {Promise}
 */
Host.prototype.setVariables = function(variables) {
    var self = this;

    return self.read()
    .then(function(config) {
        config[0].vars = variables;
        return self.write(config);
    })

    .then(function() {
        return self.commit('cluster.host.variables');
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
    var self = this,
        ref;

    if (typeof params !== 'object') {
        return Promise.reject('Illegal argument exception `params`');
    }

    if (! (role instanceof Role)) {
        return Promise.reject('Illegal argument exception `role`');
    }

    // TODO validate role parameter set

    // Set role name in parameters
    params.role = path.join(role.name(), version);

    // Add role reference in configuration
    return self.read()
    .then(function(config) {
        // Check config object
        if (typeof config[0].roles !== 'array') {
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
};

/**
 * Deactivate a role for this host.
 * @param {Role} role - Role to deactivate.
 * @return {Promise}
 */
Host.prototype.unsetRole = function(role) {
    // Remove role reference in configuration
    return self.read()
    .then(function(config) {
        // Check config object
        if (typeof config[0].roles !== 'array') {
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
    });
};

/**
 * Commit changes made in this Host configuration.
 * @param {string} comment - A comment for the commit.
 * @return {Promise}
 */
Host.prototype.commit = function(comment) {
    var self = this,
        dir  = path.resolve(this.file, '../../'),
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

// @complexity O(n)
function lookupRoleIndex(roles, rolename) {
    var found = -1;

    roles.forEach(function(item, index) {
        if ((typeof item === 'string' && path.dirname(item) === rolename)
            || (typeof item === 'object' && path.dirname(item.role) === rolename)) {

            found = index;
        }
    });

    return found;
}
