var fs        = require('fs'),
    p         = require('path'),
    promisify = require('es6-promisify'),
    rimraf    = require('rimraf');

var fsutils = {
    // Alias of rimraf promisified
    rm: promisify(rimraf),
};

/**
 * fs.mkdir (not recursive) ignoring error if directory already exists.
 * @param {string} path - Path of directory to make.
 * @param {string} mode - See fs.mkdir
 * @param {boolean} ignore - Ignore error if directory already exists.
 * @return {Promise}
 */
fsutils.mkdir = function(path, mode, ignore) {
    return new Promise(function(resolve, reject) {
        fs.mkdir(path, mode, function(err) {
            // We could have an error because the directory already exists
            // Ignore this issue of ignore is set.
            if (err && ignore) {
                fs.stat(path, function(staterr, stats) {
                    if (staterr) {
                        return reject(err);
                    }

                    if (stats.isDirectory()) {
                        return resolve();
                    }

                    return reject(err);
                });
            }

            // Reject promise if we encountered issue
            else if (err) {
                return reject(err);
            }

            // Everything is OK, resolve the Promise
            else {
                return resolve();
            }
        });
    });
};

/**
 * fs.unlink ignoring error if file is already removed.
 * @param {string} path - Path of file to remove.
 * @param {boolean} ignore - Ignore error if file doesn't exist.
 * @return {Promise}
 */
fsutils.unlink = function(path, ignore) {
    return new Promise(function(resolve, reject) {
        fs.unlink(path, function(err) {
            // We could have an error because the file doesn't exists
            if (err && ignore) {
                fs.stat(path, function(staterr) {
                    if (staterr) {
                        return resolve();
                    }

                    return reject(err);
                });
            }

            // Reject promise if we encountered issue
            else if (err) {
                return reject(err);
            }

            // Everything is OK, resolve the Promise
            else {
                return resolve();
            }
        });
    });
};

/**
 * List directories within path.
 * @param {string} path - Path to inspect, should be a directory.
 * @return {Promise} List of directories.
 */
fsutils.listdirs = function(path) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(err, files) {
            if (err) {
                return reject(err);
            }

            return resolve(files.filter(function(file) {
                return fs.statSync(p.join(path, file)).isDirectory();
            }));
        });
    });
};

/**
 * Sync test if a file exists.
 * @param {string} path - Path to test.
 * @return {boolean} True if it exists or false.
 */
fsutils.existsSync = function(path) {
    try {
        fs.statSync(path);
        return true;
    } catch(err) {
        return false;
    }
};

module.exports = fsutils;
