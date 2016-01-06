var fs      = require('fs'),
    path    = require('path'),
    fsutils = require('./fsutils.js');

module.exports = Inventory;

/**
 * Object's inventory.
 * @constructor
 * @param {string} dir - Path of this inventory.
 * @param {function} objectCreate - Function which can create the object.
 */
function Inventory(dir, objectCreate) {
    this.dir = path.resolve(dir);

    Object.defineProperty(this, 'oc', {
        enumerable: false,
        value: objectCreate
    });
}

/**
 * Get path of this inventory.
 * @return {string} Path of inventory.
 */
Inventory.prototype.path = function() {
    return this.dir;
};

/**
 * List every objects of the Inventory. An object is represented by a directory
 * on file system.
 * @return {Promise} List of objects {array} of {string} within a Promise.
 */
Inventory.prototype.list = function() {
    return fsutils.listdirs(this.dir);
};

/**
 * Fetch an object of the Inventory.
 * @param {string} name - Name of the object to fetch.
 * @return {Promise} Object fetched from the repository within a Promise.
 */
Inventory.prototype.fetch = function(name) {
    var self = this;

    return self.exists(name)
    .then(function(exists) {
        if (! exists) {
            return Promise.reject(new Error('Object doesn\'t exists'));
        }

        return Promise.resolve(self.oc(path.join(self.dir, name)));
    });
};

/**
 * Test if an object exists in this Inventory.
 * @param {string} name - Name of object to test.
 * @return {Promise} Boolean within a Promise.
 */
Inventory.prototype.exists = function(name) {
    var self = this;

    return new Promise(function(resolve, reject) {
        // Check name parameter
        if (typeof name != 'string') {
            return reject(new Error('Invalid argument exception `name`'));
        }

        // Test if directory exists.
        //   - An exception means that the file doesn't exists
        //   - Returning false means that the file isn't a directory
        try {
            if (! fs.statSync(path.join(self.dir, name)).isDirectory()) {
                return reject(new Error('Object is not well formatted'));
            }

            return resolve(true);
        } catch(e) {
            return resolve(false);
        }
    });
};
