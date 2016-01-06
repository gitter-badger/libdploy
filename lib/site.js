var path         = require('path'),
    util         = require('util'),
    Git          = require('nodegit'),
    GitHelper    = require('nodegit-helper'),
    mkdir        = require('./utils/fsutils.js').mkdir,
    rm           = require('./utils/fsutils.js').rm,
    AbstractSite = require('./abstractsite.js')

module.exports = Site;

var SITE_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/,
    DIR_MODE   = '755';

/**
 * Constructor of Site class. A Site is a Site with an integrated remote
 * repository. It allows to deploy a Site with a templated strategy.
 * @constructor
 * @param {string} local - Path to local repository.
 * @param {string} remote - Path to remote repository.
 * @param {string} template - Template of remote repository.
 */
function Site(local, remote, template) {
    this.bare = path.resolve(remote);
    this.tmpl = path.resolve(template);

    AbstractSite.call(this, local);
}

/**
 * Validate site name.
 * @param {string} name - Site name to validate.
 * @return {boolean} True if site name is valid, even false.
 */
Site.validate = function(name) {
   return SITE_REGEX.test(name);
};

/**
 * Initialize the site.
 * @override Site
 */
Site.prototype.initialize = function() {
    var self = this;

    return self.atomic(function() {

        // Create bare directory if not exists
        return mkdir(self.bare, DIR_MODE, true)

        // Initialize remote (bare) repository and optionnaly with template
        .then(function() {
            return GitHelper.initialize(self.bare, true, self.tmpl);
        })

        // Initialize AbstractSite (local) repository
        .then(function() {
            return AbstractSite.prototype.initialize.apply(self);
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
 * Deploy the site to its bare repository. This can be have several effects
 * depending template used:
 *   - This bare repository will be pulled frequently by Ansible client and than
 *     the configuration will be applied.
 *   - This bare repository contains a post-receive hook which will push the
 *     Ansible configuration.
 */
Site.prototype.deploy = function() {
    // Use GitHelper to push.
};

/**
 * Drop this site. It delete the site directory recursively.
 * @return {Promise}
 */
Site.prototype.drop = function() {
    var self = this;
    return AbstractSite.prototype.drop.apply(self)
    .then(function() {
        return rm(self.bare);
    });
};

util.inherits(Site, AbstractSite);
