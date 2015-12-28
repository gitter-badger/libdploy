var assert   = require('assert'),
    path     = require('path'),
    fs       = require('fs'),
    LibDploy = require('../');


var cluster = new LibDploy.Cluster(
    path.join('outcome', 'cluster', 'local'),
    path.join('outcome', 'cluster', 'bare'),
    path.join('fixture', 'git-tmpl'));

describe('Cluster', function() {
    describe('#initialize()', function() {
        it('should initialize the Cluster.', function() {
            return cluster.initialize()
            .then(function() {
                return assert.ok(true);
            });
        });
    });
});
