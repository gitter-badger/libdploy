var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');


var PATH_LOCAL = path.join('outcome', 'cluster', 'local'),
    PATH_BARE  = path.join('outcome', 'cluster', 'bare'),
    PATH_TMPL  = path.join('fixture', 'git-tmpl');

var cluster = new LibDploy.Cluster(PATH_LOCAL, PATH_BARE, PATH_TMPL);

describe('Cluster', function() {
    describe('#initialize()', function() {
        it('should initialize the Cluster.', function() {
            return cluster.initialize()
            .then(function() {
                return assert.ok(true);
            });
        });
        it('should contains two directories: local and bare.', function() {
            return assert.ok(fs.statSync(PATH_LOCAL) && fs.statSync(PATH_BARE));
        });
    });
});
