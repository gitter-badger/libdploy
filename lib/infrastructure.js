var path      = require('path'),
    util      = require('util'),
    Site      = require('./site.js'),
    Inventory = require('./utils/inventory.js'),
    fsutils   = require('./utils/fsutils.js');

var MASTER_DIR = 'local'; // or 'bare'

function Infrastructure(local, bare, strategies) {
    this.local = path.resolve(local);
    this.bare  = path.resolve(bare);
    this.tmpls = path.resolve(strategies);
}

/**
 * Get path of this Infrastructure.
 * @return {string} Path of infrastructure.
 */
Infrastructure.prototype.path = function() {
    return this.dir;
};


/**
 * List every site of the infrastructure. An object is represented by a
 * directory on file system.
 * @return {Promise} List of objects {array} of {string} within a Promise.
 */
Inventory.prototype.list = function() {
    return fsutils.listdirs(this[MASTER_DIR]);
};

/**
 * Create a site in this inventory.
 * @param {string} name - Site name.
 * @param {string} strategy - Strategy's name to use for this Site.
 * @return {Promise} Site object within a Promise.
 */
Infrastructure.prototype.create = function(name, strategy) {
    var site;

    if (! Site.validate(name)) {
        throw Error('Invalid site name.');
    }

    if (fsutils.existsSync(path.join(this[MASTER_DIR], name))) {
        throw Error('Site already exists.');
    }

    if (! strategy) {
        site = new Site(
            path.join(this.local, name),
            path.join(this.bare, name));
    } else {
        var template = path.join(this.tmpls, strategy);
        if (! fsutils.existsSync(template)) {
            throw Error('Strategy doesn\'t exist.');
        }

        site = new Site(
            path.join(this.local, name),
            path.join(this.bare, name),
            template);
    }

    return site.initialize()
    .then(function() {
        return site;
    });
};

/**
 * Drop a site from this inventory.
 * @param {string} name - Site name.
 * @return {Promise}
 */
Infrastructure.prototype.drop = function(name) {
    if (! Site.validate(name)) {
        throw Error('Invalid site name');
    }

    return new Site(
        path.join(this.path(), name),
        path.join(this.bare, name),
        null).drop();
};

util.inherits(Infrastructure, Inventory);

module.exports = Infrastructure;
