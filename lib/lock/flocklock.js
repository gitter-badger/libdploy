var fsExt        = require('fs-ext'),
    fsUtils      = require('../utils/fsutils.js'),
    path         = require('path'),
    promisify    = require('es6-promisify'),
    util         = require('util'),
    Lock         = require('./lock.js');

var fs = {
    close:     promisify(fsExt.close),
    flock:     promisify(fsExt.flock),
    open:      promisify(fsExt.open),
    stat:      promisify(fsExt.stat),
    writeFile: promisify(fsExt.writeFile),
};

module.exports = FlockLock;

function FlockLock(params) {
    Lock.call(this);

    var defaults = {
        path: '/var/lock/libdploy',
        retry: 0,
        timeout: 300,
    };

    this.params = extend(defaults, params || {});
}

// Inherits Lock
util.inherits(FlockLock, Lock);

FlockLock.prototype.acquire = function(key) {

    if (this.fileDescriptor) {
        return Promise.reject('This lock object is already in use.');
    }

    var file = path.join(this.params.path, key);

    // Check if the directory exists
    return fs.stat(this.params.path)
    .catch(function (err) {
        if (err && err.code === 'ENOENT') {
            return fsUtils.mkdir(this.params.path);
        }
        return Promise.reject(err);
    }.bind(this))

    // Check if file exists
    .then(function () {
        return fs.stat(file);
    })

    // Create the file if it does not exist
    .catch(function (err) {
        if (err && err.code === 'ENOENT') {
            return fs.writeFile(file, '');
        }
        return Promise.reject(err);
    })

    .then(function () {
        return fs.open(file, 'r');
    })

    // Try lock
    .then(function (fd) {
        var timeout = this.params.timeout;
        var fileDescriptor = fd;

        // Try to lock
        var promise = lock();

        // Retry N times
        for (var i = 0; i < this.params.retry; i++) {
            promise = promise.catch(retry);
        }

        // Save the locked file descriptor
        return promise.then(function () {
            this.fileDescriptor = fileDescriptor;
        }.bind(this));

        // Helper functions
        function lock () {
            return fs.flock(fileDescriptor, 'exnb');
        }

        function retry (err) {
            if (err && err.code === 'EAGAIN') {
                // Could not obtain the lock, lets wait a bit
                return new Promise(function (resolve, reject) {
                    setTimeout(resolve, timeout);
                })
                // Try to lock it again
                .then(lock);
            }
            return Promise.reject(err);
        }

    }.bind(this))

    // Close file descriptor on error
    .then(null, close.bind(this));

    function close (err) {
        if (this.fileDescriptor) {
            return fs.close(this.fileDescriptor)
            .then(function () {
                this.fileDescriptor = undefined;
                return Promise.reject(err);
            });
        } else {
            return Promise.reject(err);
        }
    }

};

FlockLock.prototype.release = function() {

    if (!this.fileDescriptor) {
        return Promise.reject('Nothing to release.');
    }

    return fs.flock(this.fileDescriptor, 'un')

    // Close file descriptor
    .then(
        close.bind(this, null),
        close.bind(this)
    );

    function close(err) {
        return fs.close(this.fileDescriptor)
        // Release file descritor
        .then(function () {
            this.fileDescriptor = undefined;
        }.bind(this))
        // Throw error if this is a rejected promise
        .then(function () {
            if (err) {
                return Promise.reject(err);
            }
        });
    }

};

function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
