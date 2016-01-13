var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');

var PATH_LOCAL     = path.join('outcome', 'infrastructure', 'local'),
    PATH_BARE      = path.join('outcome', 'infrastructure', 'bare'),
    PATH_TEMPLATES = path.join('..', 'strategies'),
    SITE_ALPHA     = 'alphaSite',
    SITE_BETA      = 'betaSite',
    STRATEGY_ALPHA = 'push';

var infrastructure = new LibDploy.Infrastructure(
        PATH_LOCAL,       // Directory which contains local repositories
        PATH_BARE,        // Directory which contains bare repositories
        PATH_TEMPLATES);  // Directory which contains strategies

describe('#list() [empty]', function() {
    it('should list an empty infrastructure.', function() {
        return infrastructure.list()
        .then(function(result) {
            assert.deepEqual(result, []);
        });
    });
});

describe('#create() [without strategy]', function() {
    it('should create a Site without deployment strategy.', function() {
        return infrastructure.create(SITE_ALPHA)
        .then(function(result) {
            assert.ok(result instanceof LibDploy.Site);
        });
    });
    it('should contain a Site directory in both bare and local.', function() {
        fs.statSync(path.join(PATH_LOCAL, SITE_ALPHA));
        fs.statSync(path.join(PATH_BARE, SITE_ALPHA));
    });
});

describe('#create() [with existing site]', function() {
    it('should NOT create a Site and throws an error.', function() {
        return assert.throws(function() {
            return infrastructure.create(SITE_ALPHA);
        });
    });
});

describe('#create() [with unknown strategy]', function() {
    it('should NOT create a Site and throws an error.', function() {
        return assert.throws(function() {
            return infrastructure.create(SITE_BETA, 'faaaake');
        });
    });
});

describe('#create() [with strategy]', function() {
    it('should create a Site with a deployment strategy.', function() {
        return infrastructure.create(SITE_BETA, STRATEGY_ALPHA)
        .then(function(result) {
            assert.ok(result instanceof LibDploy.Site);
        });
    });
    it('should contain a bare repository with strategy hook.', function() {
        fs.statSync(path.join(PATH_BARE, SITE_BETA, 'hooks', 'post-receive'));
    });
});

describe('#list() [filled]', function() {
    it('should list sites of the infrastructure.', function() {
        return infrastructure.list()
        .then(function(result) {
            assert.deepEqual(result, [SITE_ALPHA, SITE_BETA]);
        });
    });
});
