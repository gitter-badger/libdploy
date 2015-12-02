var fs = require('fs');

module.exports = {
    /**
     * TODO
     */
    mkdir: function(path, mode, ignore) {
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
    },

    unlink: function(path, ignore) {
        return new Promise(function(resolve, reject) {
            fs.unlink(path, function(err) {
                // We could have an error because the file doesn't exists
                if (err && ignore) {
                    fs.stat(path, function(staterr, stats) {
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
    },
};
