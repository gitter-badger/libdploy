var path      = require('path'),
    util      = require('util'),
    Git       = require('nodegit'),
    GitHelper = require('nodegit-helper'),
    mkdir     = require('./utils/fsutils.js').mkdir,
    Site      = require('./site.js')

module.exports = Cluster;

var CLUSTER_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/,
    DIR_MODE      = '755';

function Cluster(directory, master, template) {
    this.bare = path.resolve(master);
    this.tmpl = path.resolve(template);

    Site.call(this, directory);
}

/**
 * Validate cluster name.
 * @param {string} name - Site name to validate.
 * @return {boolean} True if cluster name is valid, even false.
 */
Cluster.validate = function(name) {
   return CLUSTER_REGEX.test(name);
};

/**
 * Initialize the cluster.
 * @override Site
 */
Cluster.prototype.initialize = function() {
    var self = this;

    return self.atomic(function() {

        // Create bare directory if not exists
        return mkdir(self.bare, DIR_MODE, true)

        // Initialize remote (bare) repository and optionnaly with template
        .then(function() {
            return GitHelper.initialize(self.bare, true, self.tmpl);
        })

        // Initialize Site (local) repository
        .then(function() {
            return Site.prototype.initialize.apply(self);
        })

        // Open local repository and add remote origin of bare to it
        .then(function() {
            return Git.Repository.open(self.path())
        })
        .then(function(repo) {
            Git.Remote.create(repo, 'origin', self.bare);
            return;
        });
    });
};


/**
 * Deploy the cluster to its bare repository. This can be have several effects
 * depending template used:
 *   - This bare repository will be pulled frequently by Ansible client and than
 *     the configuration will be applied.
 *   - This bare repository contains a post-receive hook which will push the
 *     Ansible configuration.
 */
Cluster.prototype.deploy = function() {
    // Use GitHelper to push.
};

util.inherits(Cluster, Site);
