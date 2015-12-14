var path = require('path');

function LibDploy(config) {
    // TODO Configuration !
    if (! config.directory) {
        throw Error('RTFFM'); // Read the FUTUR f***ing manual...
    }

    // Create the locker
    // TODO depends on configuration...
    this.locker = new LibDploy.FakeLocker();

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
LibDploy.Locker           = require('./lock/locker.js');
LibDploy.RedisLocker      = require('./lock/redislocker.js');
LibDploy.FakeLocker       = require('./lock/fakelocker.js');
LibDploy.FlockLocker      = require('./lock/flocklocker.js');

module.exports = LibDploy;
