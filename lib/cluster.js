var path     = require('path'),
    util     = require('util'),
    mkdir    = require('./utils.js').mkdir,
    unlink   = require('./utils.js').unlink,
    Playbook = require('./playbook.js'),
    Host     = require('./host.js');

module.exports = Cluster;

function Cluster(directory) {
    Object.defineProperty(this, 'dir', {
        enumerable: false,
        value: path.resolve(directory),
    });

    Playbook.call(this, path.join(this.dir, 'site.yml'));
}

// Inherits
util.inherits(Cluster, Playbook);

/**
 * Get cluster name.
 * @return {string} Cluster's name.
 */
Cluster.prototype.name = function() {
    return path.basename(this.dir);
};

/**
 * Initialize this cluster. It creates directory tree and configuration files.
 * @return {Promise}
 */
Cluster.prototype.initialize = function() {
    var self = this;

    // Create directory if not exists
    return mkdir(self.dir, '755', true)

    // Create directory tree (hosts, roles, vars)
    .then(function() {
        return mkdir(path.join(self.dir, 'hosts'), '755', true);
    })
    .then(function() {
        return mkdir(path.join(self.dir, 'roles'), '755', true);
    })
    .then(function() {
        return mkdir(path.join(self.dir, 'vars'), '755', true);
    })

    // Write configuration file
    .then(function() {
        return self.write([]);
    })

    // TODO Git init
    .then(function() {
        return Promise.resolve();
    });
};

/**
 * List activated hosts of this cluster.
 * @return {Promise} Array of string within a Promise.
 */
Cluster.prototype.hosts = function() {
    // Read playbook configuration
    return this.read()

    // Filter every include statements and return filename
    .then(function(config) {
        return Promise.resolve(config
        .filter(function(item) {
            return item.include;
        })
        .map(function(item) {
            return path.basename(item.include, '.yml');
        }));
    });
};

/**
 * Get host object from hostname.
 * @param {string} hostname - Hostname to retrieve.
 * @return {Promise} Host object within a Promise.
 */
Cluster.prototype.host = function(hostname) {
    var self = this;
    // Read current configuration
    return self.read()
    .then(function(config) {
        // Test if host exists in cluster configuration
        if (lookupHostIndex(config, hostname) === -1) {
            return Promise.reject('Host does not exists in cluster');
        }

        // Return the host object
        return Promise.resolve(
            new Host(path.join(self.dir, 'hosts', hostname + '.yml')));
    });
};

/**
 * Add an existing (already created) host in this cluster. It will add the
 * reference in cluster configuration.
 * @param {Host} host - Host to add in this cluster.
 *"@return {Promise}
 */
Cluster.prototype.addHost = function(host) {
    var self = this;

    // Test host parameter
    if (! (host instanceof Host)) {
        return Promise.reject('Illegal argument exception `host`');
    }

    // Read current configuration
    return this.read()
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
    });
};

/**
 * Remove reference of host from cluster configuration. It will NOT destroy the
 * host configuration itself. It's a way to deactivate a host without delete its
 * configuration.
 * @param {string|Host} host - Host or hostname to remove.
 * @return {Promise}
 */
Cluster.prototype.removeHost = function(host) {
    var self = this;

    // Get hostname if instanceof Host and ensure that host is a string.
    if (host instanceof Host) {
        host = host.name();
    }

    if (typeof host !== 'string') {
        return Promise.reject('Illegal argument exception `host`')
    }

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
    });
};

/**
 * Create a Host in this cluster. It will generate configuration file but it
 * will NOT add it in cluster references. It could be useful if you wan't to
 * create a Host without "activate" it.
 * @param {string} hostname - Hostname of host.
 * @return {Promise} Host object within a Promise.
 */
Cluster.prototype.createHost = function(hostname) {
    var self = this;

    // Check hostname
    if (! Host.validate(hostname)) {
        return Promise.reject('Invalid argument exception: `hostname`');
    }

    // Create configuration file in hosts directory
    var host = new Host(path.join(self.dir, 'hosts', hostname + '.yml'));

    // Initialize a new host
    return host.initialize()

    // Return created host
    .then(function() {
        return Promise.resolve(host);
    });
};

/**
 * Remove a host from this cluster and its configuration.
 * @param {string} hostname - Name of host to remove.
 * @return {Promise}
 */
Cluster.prototype.destroyHost = function(hostname) {
    var self = this;

    // Try to remove host for cluster playbook
    return self.removeHost(hostname)
    .catch(function() {
        // Ignore issues
        return Promise.resolve();
    })
    // Delete configuration file for host in hosts directory
    .then(function() {
        return unlink(path.join(self.dir, 'hosts', hostname + '.yml'));
    });
};

Cluster.prototype.roles = function() {
    // TODO List directories in "roles" directory.
    
};

Cluster.prototype.role = function(rolename) {

};

Cluster.prototype.installRole = function (rolename, version) {

};


//
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
