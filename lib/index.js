var path = require('path');

function LibDploy(config) {
    // TODO Configuration !
    if (! config.directory) {
        throw Error('RTFFM'); // Read the FUTUR f***ing manual...
    }

    // Clusters inventory
    this.clusters = new LibDploy.ClusterInventory(
        path.join(config.directory, 'clusters'), this.locker);

    // Roles inventory
    this.roles = new LibDploy.RoleInventory(
        path.join(config.directory, 'roles'));
}

LibDploy.Cluster          = require('./cluster.js');
LibDploy.Host             = require('./host.js');
LibDploy.Role             = require('./role.js');
LibDploy.ClusterInventory = require('./clusterinventory.js');
LibDploy.RoleInventory    = require('./roleinventory.js');

module.exports = LibDploy;
