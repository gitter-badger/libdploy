var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');

var DIRECTORY    = 'fixture/',
    CLUSTER_NAME = 'office408',
    HOST_NAME    = 'database.example.com';

var dploy = new LibDploy({
    directory: DIRECTORY
});

// Test if our fixtures are created.
describe('RoleInventory', function() {
    it('inherits Inventory');

    describe('#list()', function () {
        it('should return an array of roles name.', function() {
            return dploy.roles.list()
            .then(function(result) {
                return assert.deepEqual(result, ['database', 'monitoring']);
            });
        });
    });

    describe('#exists()', function()  {
        it('should return `true` if role exists.', function() {
            return dploy.roles.exists('database')
            .then(function(result) {
                return assert.ok(result);
            });
        });
        it('should return `false` if role doesn\'t exist.', function() {
            return dploy.roles.exists('notHere')
            .then(function(result) {
                return assert.ok(! result);
            });
        });
    });

    describe('#fetch()', function()  {
        it('should return a Role.', function() {
            return dploy.roles.fetch('database')
            .then(function(result) {
                return assert.ok(result instanceof LibDploy.Role);
            });
        });
        it('should reject the Promise if the Role doesn\'t exists.', function() {
            return dploy.roles.fetch('notHere')
            .catch(function(result) {
                return assert.ok(true);
            });
        });
    });
});

describe('ClusterInventory', function() {
    it('inherits Inventory');

    describe('#list()', function () {
        it('should return an empty array when not any Cluster created.', function () {
            return dploy.clusters.list()
            .then(function(result) {
                return assert.deepEqual(result, []);
            });
        });
        context('directory tree check:', function() {
            it('the directory tree "<DIRECTORY>/clusters/" should be empty.', function() {
                return assert.deepEqual(fs.readdirSync(path.join(DIRECTORY, 'clusters')), []);
            });
        });
    });

    describe('#create()', function () {
        it('should throw an Error if Cluster\'s name is illegal.', function() {
            return assert.throws(function() {
                dploy.clusters.create('/../invalid/../');
            });
        });
        it('should create and return a Cluster.', function () {
            return dploy.clusters.create(CLUSTER_NAME)
            .then(function(result) {
                return assert.ok(result instanceof LibDploy.Cluster);
            });
        });
        it('should reject the Promise if Cluster already exists.', function() {
            return dploy.clusters.create(CLUSTER_NAME)
            .catch(function(err) {
                return assert.ok(true);
            });
        });
        context('directory tree check:', function() {
            it('the directory tree should contains "<DIRECTORY>/clusters/<CLUSTER_NAME>".', function() {
                return assert.ok(fs.existsSync(path.join(DIRECTORY, 'clusters', CLUSTER_NAME)));
            });
        });
    });

    describe('#list()', function () {
        it('should now return an array with only one item.', function () {
            return dploy.clusters.list()
            .then(function(result) {
                return assert.deepEqual(result, [CLUSTER_NAME]);
            });
        });
    });

    describe('#drop()', function () {
        it('should throw an Error if Cluster\'s name is illegal.', function() {
            return assert.throws(function() {
                dploy.clusters.drop('/../invalid/../');
            });
        });
        it('should reject the Promise if Cluster doesn\'t exist.', function() {
            return dploy.clusters.drop('notHere')
            .catch(function() {
                return assert.ok(true);
            });
        });
        it('should remove a Cluster from its name.', function () {
            return dploy.clusters.drop(CLUSTER_NAME)
            .then(function() {
                return dploy.clusters.list();   // Already tested ;-)
            })
            .then(function(result) {
                return assert.deepEqual(result, []);
            });
        });
        context('directory tree check:', function() {
            it('the directory tree should NOT contains "<DIRECTORY>/clusters/<CLUSTER_NAME>".', function() {
                return assert.ok(! fs.existsSync(path.join(DIRECTORY, 'clusters', CLUSTER_NAME)));
            });
        });
    });

    // TODO check directory structure

    describe('#exists()', function()  {
        it('is already tested by RoleInventory#exists()');
    });

    describe('#fetch()', function()  {
        it('is already tested by RoleInventory#fetch()');
    });
});

describe('Cluster', function() {
    var cluster, host;

    before(function() {
        return dploy.clusters.create(CLUSTER_NAME)
        .then(function(_cluster) {
            cluster = _cluster;
        });
    });

    describe('#initialize()', function() {
        it('is already tested by ClusterInventory#create().');
        it('should reinitialize the Cluster.', function() {
            return cluster.initialize()
            .then(function() {
                return assert.ok(true);
            });
        });
    });

    describe('#hosts()', function() {
        it('should return an empty array when not any Host exists.', function () {
            return cluster.hosts()
            .then(function(result) {
                return assert.deepEqual(result, []);
            });
        });
    });

    describe('#createHost()', function() {
        it('should throw an Error if host name is invalid.', function() {
            return assert.throws(function() {
                cluster.createHost('/../invalid/../');
            });
        });
        it('should create a Host in this Cluster.', function() {
            return cluster.createHost(HOST_NAME)
            .then(function(result) {
                host = result;
                return assert.ok(result instanceof LibDploy.Host);
            });
        });
        it('should reject the Promise if Host already exists.', function() {
            return cluster.createHost(HOST_NAME)
            .catch(function() {
                return assert.ok(true);
            });
        });
        context('directory tree check:', function() {
            it('the directory tree should contains "<DIRECTORY>/clusters/<CLUSTER_NAME>/hosts/<HOST_NAME>".', function() {
                return assert.ok(fs.existsSync(path.join(DIRECTORY, 'clusters', CLUSTER_NAME, 'hosts', HOST_NAME + '.yml')));
            });
        });
    });

    describe('#addHost()', function() {
        it('should throw an Error if host parameter is not an object Host.', function() {
            return assert.throws(function() {
                cluster.addHost('hostname');
            });
        });
        it('should add the Host in this Cluster.', function() {
            return cluster.addHost(host)
            .then(function() {
                return assert.ok(true);
            });
        });
        it('should reject the Promise if the Host is already added in this Cluster.', function() {
            return cluster.addHost(host)
            .catch(function() {
                return assert.ok(true);
            });
        });
        context('directory tree check:', function() {
            it('validates Cluster main configuration file.', function() {"- include: hosts/database.example.com.yml\n"
                return assert.equal(
                    fs.readFileSync(path.join(DIRECTORY, 'clusters', CLUSTER_NAME, 'site.yml')).toString(),
                    "- include: hosts/database.example.com.yml\n");
            });
        });
    });

    // TODO check directory structure

    describe('#dropHost()', function() {

    });
});
