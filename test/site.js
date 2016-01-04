var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');


var PATH_ALPHA = path.join('outcome', 'site', 'alpha'),
    HOST_ALPHA = 'example',
    CFG_EXT    = '.yml';

// Instanciate a Site object before test it !
var site = new LibDploy.Site(PATH_ALPHA);

/**
 * Initialize a Site by creating several directoires and configuration files.
 */
describe('#initialize()', function() {
    it('should initialize the Site.', function() {
        return site.initialize();
    });
    it('should create a site directory with a specific tree.', function() {
        fs.statSync(PATH_ALPHA);
        fs.statSync(path.join(PATH_ALPHA, 'roles'));
        fs.statSync(path.join(PATH_ALPHA, 'hosts'));
        fs.statSync(path.join(PATH_ALPHA, 'site.yml'));
    });
});

describe('#hosts() [empty]', function() {
    it('should list hosts of the site: an empty array.', function() {
        return site.hosts()
        .then(function(result) {
            assert.deepEqual(result, []);
        });
    });
});

/**
 * Test both `createHost` and `addHost` functions. It should create and add a
 * new host in this Site.
 * @NOTE Host#initialize() needs to be tested before !!
 */
describe(['#createHost()', '#addHost()'], function() {
    it('should create and add a host.', function() {
        return site.createHost(HOST_ALPHA)
        .then(function(host) {
            assert.ok(host instanceof LibDploy.Host);
            return site.addHost(host);
        });
    });
    it('should contain a host configuration file.', function() {
        fs.statSync(path.join(PATH_ALPHA, 'hosts', HOST_ALPHA + CFG_EXT));
    });
    // TODO check site.yml
});

describe('#hosts() [filled]', function() {
    it('should list hosts of the site: an array with an element.', function() {
        return site.hosts()
        .then(function(result) {
            assert.deepEqual(result, [HOST_ALPHA]);
        });
    });
});

/**
 * Test both `dropHost` and `removeHost` functions. It should remove and drop a
 * host from its name.
 */
describe(['#dropHost()', '#removeHost()'], function() {
    it('should remove and drop a host.', function() {
        return site.dropHost(HOST_ALPHA);
    });
    it('should contain a host configuration file.', function() {
        return assert.throws(function() {
            fs.statSync(path.join(PATH_ALPHA, 'hosts', HOST_ALPHA + CFG_EXT));
        });
    });
    // TODO check site.yml
});

describe('#hosts() [empty]', function() {
    it('should list hosts of the site: an empty array.', function() {
        return site.hosts()
        .then(function(result) {
            assert.deepEqual(result, []);
        });
    });
});

describe('#drop()', function() {
    it('should drop the Site.', function() {
        return site.drop();
    });
    it('should miss the site directory.', function() {
        return assert.throws(function() {
            fs.statSync(PATH_ALPHA);
        });
    });
});
