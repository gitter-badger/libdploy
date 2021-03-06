var path      = require('path'),
    Git       = require('nodegit'),
    GitHelper = require('nodegit-helper'),
    YAMLFile  = require('./utils/yamlfile.js');

function Role(directory) {
    Object.defineProperty(this, 'dir', {
        enumerable: false,
        value: path.resolve(directory),
    });
}

/**
 * Get the name of this role.
 * @return {string} Name of this role.
 */
Role.prototype.name = function() {
    return path.basename(this.dir, '.git');
};

/**
 * Get the path of this role.
 * @return {string} Path of this role.
 */
Role.prototype.path = function() {
    return this.dir;
};

/**
 * Get active version of this role.
 * @return {Promise} A string representing the version.
 */
Role.prototype.version = function() {
    var self = this;

    // Get current branch
    return Git.Repository.open(self.dir)
    .then(function(repo) {
        return GitHelper.branch(repo);
    });
};

/**
 * List available versions of this role.
 * @return {Promise} Array of string within a Promise.
 */
Role.prototype.versions = function() {
    var self = this;

    // List branches
    return Git.Repository.open(self.dir)
    .then(function(repo) {
        return GitHelper.branches(repo);
    });
};

/**
 * Read Role metadata.
 * @return {Promise} Metadata of this host within a Promise.
 */
Role.prototype.metadata = function() {
    return new YAMLFile(path.join(this.dir, 'meta', 'main.yml')).read(true);
};

module.exports = Role;
