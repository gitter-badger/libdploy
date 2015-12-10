var path      = require('path'),
    util      = require('util'),
    Cluster   = require('./cluster.js'),
    Inventory = require('./utils/inventory.js');

module.exports = ClusterInventory;

function ClusterInventory(dir, locker) {
    this.locker = locker;
    Inventory.call(this, dir, function(path) {
        return new Cluster(path, locker);
    });
}

/**
 * Create a cluster in this inventory.
 * @param {string} name - Cluster name.
 * @return {Promise} Cluster object within a Promise.
 */
ClusterInventory.prototype.create = function(name) {
    if (! Cluster.validate(name)) {
        throw Error('Invalid cluster name');
    }

    var cluster = new Cluster(path.join(this.dir, name), this.locker);

    return cluster.initialize()
    .then(function() {
        return cluster;
    })
};

/**
 * Drop a cluster from this inventory.
 * @param {string} name - Cluster name.
 * @return {Promise}
 */
ClusterInventory.prototype.drop = function(name) {
    if (! Cluster.validate(name)) {
        throw Error('Invalid cluster name');
    }

    return new Cluster(path.join(this.dir, name), this.locker).drop();
};

util.inherits(ClusterInventory, Inventory);
