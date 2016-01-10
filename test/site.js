var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');


var PATH_LOCAL = path.join('outcome', 'site', 'local'),
    PATH_BARE  = path.join('outcome', 'site', 'bare'),
    PATH_TMPL  = path.join('fixture', 'git-tmpl'),
    HOST_ALPHA = 'example',
    CFG_EXT    = '.yml';


// Instanciate a Site object before test it !
var site = new LibDploy.Site(PATH_LOCAL, PATH_BARE, PATH_TMPL);


/**
 * Test the Site initialization. When the API initialize a Site it should
 * create two different directories:
 *   - The local repository contains the most recent and NON effective
 *     modifications of this site. It will be pushed to the bare repository.
 *   - The bare repository contains the most recent and EFFECTIVE modifications.
 *     Depending the template (3rd argument), this repository will be pulled or
 *     pushed to/by ansible client.
 * @NOTE Site#initialize() needs to be tested before !!
 */
describe('#initialize()', function() {
    it('should initialize the Site.', function() {
        return site.initialize();
    });
    it('should create two directories: local and bare.', function() {
        fs.statSync(PATH_LOCAL);
        fs.statSync(PATH_BARE);
    });
    it('should create a local site directory with a specific tree.', function() {
        fs.statSync(path.join(PATH_LOCAL, 'roles'));
        fs.statSync(path.join(PATH_LOCAL, 'hosts'));
        fs.statSync(path.join(PATH_LOCAL, 'site.yml'));
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
 * new host in this AbstractSite.
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
        fs.statSync(path.join(PATH_LOCAL, 'hosts', HOST_ALPHA + CFG_EXT));
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
            fs.statSync(path.join(PATH_LOCAL, 'hosts', HOST_ALPHA + CFG_EXT));
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

/**
 * TODO test deploy method
 */
describe('#deploy()', function() {
    this.timeout(20000);

    it('should deploy the Site repository from local to bare', function() {
        return site.deploy();
    });
    it('check bare repository', function() {
        return fs.statSync(path.join(PATH_BARE, 'validation'));
    });
});

describe('#drop', function() {
    it('should drop the Site with both local and bare repositories', function() {
        return site.drop();
    });
    it('should miss the Site directories.', function() {
        assert.throws(function() {
            fs.statSync(PATH_LOCAL);
        });
        assert.throws(function() {
            fs.statSync(PATH_BARE);
        });
    });
});
