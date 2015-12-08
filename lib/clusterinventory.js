var path      = require('path'),
    util      = require('util'),
    Cluster   = require('./cluster.js'),
    Inventory = require('./inventory.js');

module.exports = ClusterInventory;

function ClusterInventory(dir) {
    Inventory.call(this, dir, function(path) {
        return new Cluster(path);
    });
}

/**
 * Create a cluster in this inventory.
 * @param {string} name - Cluster name.
 * @return {Promise} Cluster object within a Promise.
 */
ClusterInventory.prototype.create = function(name) {
    var cluster = new Cluster(path.join(this.dir, name));

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
    // TODO
};

util.inherits(ClusterInventory, Inventory);
