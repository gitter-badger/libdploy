var path      = require('path'),
    util      = require('util'),
    Git       = require('nodegit'),
    GitHelper = require('nodegit-helper'),
    mkdir     = require('./utils/fsutils.js').mkdir,
    rm        = require('./utils/fsutils.js').rm,
    Site      = require('./site.js')

module.exports = Cluster;

var CLUSTER_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/,
    DIR_MODE      = '755';

/**
 * Constructor of Cluster class. A Cluster is a Site with an integrated remote
 * repository. It allows to deploy a Site with a templated strategy.
 * @constructor
 * @param {string} local - Path to local repository.
 * @param {string} remote - Path to remote repository.
 * @param {string} template - Template of remote repository.
 */
function Cluster(local, remote, template) {
    this.bare = path.resolve(remote);
    this.tmpl = path.resolve(template);

    Site.call(this, local);
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

/**
 * Drop this cluster. It delete the cluster directory recursively.
 * @return {Promise}
 */
Cluster.prototype.drop = function() {
    var self = this;
    return Site.prototype.drop.apply(self)
    .then(function() {
        return rm(self.bare);
    });
};

util.inherits(Cluster, Site);
