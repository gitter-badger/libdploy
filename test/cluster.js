var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');


var PATH_LOCAL = path.join('outcome', 'cluster', 'local'),
    PATH_BARE  = path.join('outcome', 'cluster', 'bare'),
    PATH_TMPL  = path.join('fixture', 'git-tmpl');

// Instanciate a Cluster object before test it !
var cluster = new LibDploy.Cluster(PATH_LOCAL, PATH_BARE, PATH_TMPL);


/**
 * Test the Cluster initialization. When the API initialize a Cluster it should
 * create two different directories:
 *   - The local repository contains the most recent and NON effective
 *     modifications of this cluster. It will be pushed to the bare repository.
 *   - The bare repository contains the most recent and EFFECTIVE modifications.
 *     Depending the template (3rd argument), this repository will be pulled or
 *     pushed to/by ansible client.
 * @NOTE Site#initialize() needs to be tested before !!
 */
describe('#initialize()', function() {
    it('should initialize the Cluster.', function() {
        return cluster.initialize();
    });
    it('should create two directories: local and bare.', function() {
        fs.statSync(PATH_LOCAL);
        fs.statSync(PATH_BARE);
    });
});

/**
 * TODO test deploy method
 */
describe('#deploy()', function() {
    it('should deploy the Cluster repository from local to bare', function() {
        return true;    // TODO
    });
});
