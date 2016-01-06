var path      = require('path'),
    util      = require('util'),
    Git       = require('nodegit'),
    GitHelper = require('nodegit-helper'),
    exists    = require('./utils/fsutils.js').existsSync,
    listdirs  = require('./utils/fsutils.js').listdirs,
    mkdir     = require('./utils/fsutils.js').mkdir,
    rm        = require('./utils/fsutils.js').rm,
    unlink    = require('./utils/fsutils.js').unlink,
    Host      = require('./host.js'),
    Lock      = require('./utils/lock.js'),
    Role      = require('./role.js'),
    YAMLFile  = require('./utils/yamlfile.js');

var DIR_MODE = '755';

module.exports = AbstractSite;

function AbstractSite(directory) {
    Object.defineProperty(this, 'dir', {
        enumerable: false,
        value: path.resolve(directory),
    });

    Object.defineProperty(this, 'lock', {
        enumerable: false,
        value: new Lock(path.join(this.dir, '.lock'))
    })

    YAMLFile.call(this, path.join(this.dir, 'site.yml'));
}

// Inherits YAMLFile
util.inherits(AbstractSite, YAMLFile);

/**
 * Get cluster name.
 * @return {string} Site's name.
 */
AbstractSite.prototype.name = function() {
    return path.basename(this.dir);
};

/**
 * Get cluster directory.
 * @return {string} Site's directory.
 */
AbstractSite.prototype.path = function() {
    return this.dir;
};

/**
 * Initialize this cluster. It creates directory tree and configuration files.
 * @return {Promise}
 */
AbstractSite.prototype.initialize = function() {
    var self = this,
        repo;

    return self.atomic(function () {

        // Create directory if not exists
        // NOTE: It should be automatically created by Lock object since lock
        //       file is in repository.
        // TODO: Set same DIR_MODE to mkdir in Lock class.
        return mkdir(self.dir, DIR_MODE, true)

        // Create directory tree (hosts, roles, vars)
        .then(function() {
            return mkdir(path.join(self.dir, 'hosts'), DIR_MODE, true);
        })
        .then(function() {
            return mkdir(path.join(self.dir, 'roles'), DIR_MODE, true);
        })

        // Write configuration file
        .then(function() {
            return self.write([]);
        })

        // Git repository initialization
        .then(function() {
            return Git.Repository.init(self.dir, 0);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.addFile(repo, path.relative(self.dir, self.file));
        })
        // Commit changes
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.initialize');
        });

    });
};

/**
 * Drop this cluster. It delete the cluster directory recursively.
 * @return {Promise}
 */
AbstractSite.prototype.drop = function() {
    return rm(this.dir);
};

/**
 * List activated hosts of this cluster.
 * @return {Promise} Array of string within a Promise.
 */
AbstractSite.prototype.hosts = function() {
    // Read playbook configuration
    return this.read()

    // Filter every include statements and return filename
    .then(function(config) {
        return config.filter(function(item) {
            return item.include;
        })
        .map(function(item) {
            return path.basename(item.include, '.yml');
        });
    });
};

/**
 * Get host object from hostname.
 * @param {string} hostname - Hostname to retrieve.
 * @return {Promise} Host object within a Promise.
 */
AbstractSite.prototype.host = function(hostname) {
    var self = this;

    // Read current configuration
    return self.read()
    .then(function(config) {
        // Test if host exists in cluster configuration
        if (lookupHostIndex(config, hostname) === -1) {
            return Promise.reject('Host does not exists in cluster');
        }

        // Return the host object
        return new Host(self, path.join(self.dir, 'hosts', hostname + '.yml'));
    });
};

/**
 * Add an existing (already created) host in this cluster. It will add the
 * reference in cluster configuration.
 * @param {Host} host - Host to add in this cluster.
 *"@return {Promise}
 */
AbstractSite.prototype.addHost = function(host) {
    var self = this,
        repo;

    // Test host parameter
    if (! (host instanceof Host)) {
        throw Error('Illegal argument exception `host`');
    }

    return self.atomic(function () {

        // Read current configuration
        return self.read()

        .then(function(config) {
            // Test if host already exists in cluster configuration
            if (lookupHostIndex(config, host.name()) !== -1) {
                return Promise.reject('Host already added in cluster');
            }

            // Add "include" directive in cluster playbook
            config.push({
                include: path.relative(self.dir, host.path())
            });

            return self.write(config);
        })

        // Commit changes
        .then(function() {
            return Git.Repository.open(self.dir);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.addFile(repo, path.relative(self.dir, self.file));
        })
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.host.add');
        });

    });
};

/**
 * Remove reference of host from cluster configuration. It will NOT destroy the
 * host configuration itself. It's a way to deactivate a host without delete its
 * configuration.
 * @param {string|Host} host - Host or hostname to remove.
 * @return {Promise}
 */
AbstractSite.prototype.removeHost = function(host) {
    var self = this;

    // Get hostname if instanceof Host and ensure that host is a string.
    if (host instanceof Host) {
        host = host.name();
    }

    if (typeof host !== 'string') {
        return Promise.reject('Illegal argument exception `host`');
    }

    return self.atomic(function () {

        // Read configuration
        return self.read()

        // Lookup host index in cluster playbook
        .then(function(config) {
            var index = lookupHostIndex(config, host);
            if (index === -1) {
                return Promise.reject('Host is not set in this cluster');
            }

            // Remove "include" statement from cluster playbook
            config.splice(index, 1);
            return self.write(config);
        })

        // Commit changes
        .then(function() {
            return Git.Repository.open(self.dir);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.addFile(repo, path.relative(self.dir, self.file));
        })
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.host.remove');
        });

    });
};

/**
 * Rename a Host and change references to it in the cluster.
 * @param {Host} host - Host to rename.
 * @param {string} newname - New name of the host.
 * @return {Promise} Renamed Host within a Promise.
 */
AbstractSite.prototype.renameHost = function(host, newname) {
    var self     = this,
        previous = host.name();

    return self.atomic(function () {

        return self.read()

        .then(function (config) {

            // First check if the host exists in the cluster
            var index = lookupHostIndex(config, previous);
            if (index === -1) {
                return Promise.reject('Host does not exist in this cluster');
            }

            // Rename the host
            return host.rename(newname, false)
            // Change the references to this host in the cluster
            .then(function () {
                // Replace "include" directive in cluster playbook
                config[index] = {
                    include: path.relative(self.dir, host.path())
                };
                return config;
            });
        })

        // Write the configuration
        .then(function(config) {
            return self.write(config);
        })

        // Commit changes
        .then(function() {
            return Git.Repository.open(self.dir);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.addFile(repo, path.relative(self.dir, self.file));
        })
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.host.rename');
        })

        .then(function() {
            return host;
        });

    });
};

/**
 * Create a Host in this cluster. It will generate configuration file but it
 * will NOT add it in cluster references. It could be useful if you wan't to
 * create a Host without "activate" it.
 * @param {string} hostname - Hostname of host.
 * @return {Promise} Host object within a Promise.
 */
AbstractSite.prototype.createHost = function(hostname) {
    var self = this;

    // Check hostname
    if (! Host.validate(hostname)) {
        throw Error('Invalid argument exception: `hostname`');
    }

    // Create configuration file in hosts directory
    var host = new Host(this, path.join(self.dir, 'hosts', hostname + '.yml'));

    // Initialize a new host
    return host.initialize()

    // Return created host
    .then(function() {
        return host;
    });
};

/**
 * Remove a host from this cluster and its configuration.
 * @param {string} hostname - Name of host to remove.
 * @return {Promise}
 */
AbstractSite.prototype.dropHost = function(hostname) {
    var self     = this,
        hostfile = path.join('hosts', hostname + '.yml'),
        repo;

    return self.atomic(function () {

        // Try to remove host for cluster playbook
        return self.removeHost(hostname).catch(function () {
            // Ignore issues
        })

        // Delete configuration file for host in hosts directory
        .then(function () {
            return unlink(path.join(self.dir, hostfile));
        })

        // Commit changes
        .then(function() {
            return Git.Repository.open(self.dir);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.removeFile(repo, hostfile);
        })
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.host.drop');
        });

    });
};

/**
 * List roles installed on this cluster.
 * @return {Promise} Array of string within a Promise.
 */
AbstractSite.prototype.roles = function() {
    var self = this;

    // List directories in "roles" directory.
    return listdirs(path.join(self.dir, 'roles'));
};

/**
 * Clone Role repository in a specific version.
 * @param {Role} role - Role to install.
 * @param {string} version - Version of the role.
 * @return {Promise}
 */
AbstractSite.prototype.installRole = function(role, version) {
    var self = this,
        repo;

    // Validate parameters
    if (! (role instanceof Role)) {
        return Promise.reject('Invalid argument exception `role`');
    }
    if (typeof version !== 'string') {
        return Promise.reject('Invalid argument exception `version`');
    }

    // Local directory of this role
    var role_dir = path.join(self.dir, 'roles', role.name());

    // Test if role already exists even exit
    if (exists(path.join(role_dir, version))) {
        return Promise.resolve();
    }

    return self.atomic(function () {

        // Test if branch exists
        return role.versions()

        .then(function(versions) {
            if (versions.indexOf(version) === -1) {
                return Promise.reject('Unknow version');
            }

            // Create directory for all versions of this role
            return mkdir(role_dir, DIR_MODE, true);
        })

        // Clone role repository in roles directory
        .then(function() {
            return Git.Clone(role.path(), path.join(role_dir, version), null);
        })

        // Change role version (@branch)
        .then(function(subrepo) {
            return GitHelper.checkoutRemoteBranch(subrepo, version);
        })

        // Add role as a submodule
        .then(function() {
            return Git.Repository.open(self.dir);
        })
        .then(function(_repo) {
            repo = _repo;
            return GitHelper.addSubmodule(
                repo,                                       // Site repository
                role.path(),                                // Remote role path
                path.join('roles', role.name(), version));  // Local repository
        })

        // Commit changes
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.role.install');
        });

    });
};

/**
 * Drop Role repository in a specific version.
 * @param {Role} role - Role to remove.
 * @param {string} version - Version of the role.
 * @return {Promise}
 */
AbstractSite.prototype.dropRole = function(role, version) {
    var self = this,
        repo;

    return self.atomic(function () {

        // First open Git repository
        return Git.Repository.open(self.dir)

        // Remove role (@git submodule)
        .then(function(_repo) {
            repo = _repo;

            return GitHelper.removeSubmodule(
                repo,
                path.join('roles', role.name(), version));
        })

        // Commit changes
        .then(function() {
            return GitHelper.commit(repo, null, 'cluster.role.drop');
        });

        // TODO Delete role repo if no more version (not mandatory)

    });
};

/**
 * Update every roles repository.
 * @return {Promise}
 */
AbstractSite.prototype.updateRoles = function() {
    var self = this;

    return listdirs(path.join(self.dir, 'roles'))
    .then(function(roles) {
        // Convert roles into promises
        return Promise.all(roles.map(function(role) {
            return self.updateRole(role);
        }));
    });
};

/**
 * Update every versions of a role.
 * @param {string} rolename - Role to update.
 * @return {Promise}
 */
AbstractSite.prototype.updateRole = function(rolename) {
    var self = this;

    return listdirs(path.join(self.dir, 'roles', rolename))
    .then(function(versions) {
        // Convert versions into promises
        return Promise.all(versions.map(function(version) {
            return self.updateRoleVersion(rolename, version);
        }));
    });
};

/**
 * Update role repository in a specific version.
 * @param {string} rolename - Role to update.
 * @param {string} version - Version of the role to update.
 * @return {Promise}
 */
AbstractSite.prototype.updateRoleVersion = function(rolename, version) {
    var self = this;

    return Git.Repository.open(path.join(self.dir, 'roles', rolename, version))
    .then(function(repo) {
        return GitHelper.pullCurrentBranch(repo);
    });
};

/**
 * Execute a function in a environment protected by the cluster's lock
 * @param {Function} callback - Function to execute.
 * @return {Promise}
 */
AbstractSite.prototype.atomic = function(callback) {
    return this.lock.synchronized(callback);
};

// @complexity O(n)
function lookupHostIndex(config, hostname) {
    var found = -1;

    config.forEach(function(item, index) {
        if (item.include === path.join('hosts', hostname + '.yml')) {
            found = index;
        }
    });
    return found;
}
