/**
 * Authors adaxi / rmedaer
 *
 */
var fsext     = require('fs-ext'),
    fsutils   = require('./fsutils.js'),
    path      = require('path'),
    promisify = require('es6-promisify');

var fs = {
    close:     promisify(fsext.close),
    flock:     promisify(fsext.flock),
    open:      promisify(fsext.open),
    stat:      promisify(fsext.stat),
    writeFile: promisify(fsext.writeFile),
};

/**
 * TODO fs lock system description
 * @param {string} file - Path of locking file.
 * @param {integer} retry - Number of retry attempt to lock.
 * @param {integer} timeout - Timeout // TODO NOT a lock timeout it self..
 */
function Lock(file, retry, timeout) {
    // Resolve file path
    this.file = path.resolve(file);

    // Initialize acquire/release counter.
    this.rc = 0;

    // Set retry parameter even default retry
    this.retry = 0;
    if (typeof retry === 'number') {
        this.retry = retry;
    }

    // Set timeout parameter even default timeout
    this.timeout = 300;
    if (typeof timeout === 'number') {
        this.timeout = timeout;
    }
}

/**
 * Acquire the lock.
 * TODO
 */
Lock.prototype.acquire = function() {
    var self = this;

    // Check that lock is not already locked.
    if (self.fd) {
        self.rc++;
        return Promise.resolve();
    }

    // Check if the directory exists
    return fs.stat(path.dirname(self.file))
    .catch(function(err) {
        if (err && err.code === 'ENOENT') {
            return fsutils.mkdir(path.dirname(self.file));
        }
        return Promise.reject(err);
    })

    // Check if file exists even create it
    .then(function() {
        return fs.stat(self.file)

        .catch(function (err) {
            if (err && err.code === 'ENOENT') {
                return fs.writeFile(self.file, '');
            }
            return Promise.reject(err);
        });
    })

    // Open lock file
    .then(function() {
        return fs.open(self.file, 'r');
    })

    // Try lock
    .then(function(fd) {
        // Try to lock
        var promise = lock();

        // Retry N times
        for (var i = 0; i < self.retry; i++) {
            promise = promise.catch(retry);
        }

        // Save the locked file descriptor
        return promise.then(function () {
            self.rc++;
            self.fd = fd;
        });

        // Helper functions
        function lock() {
            return fs.flock(fd, 'exnb'); // Atomic
        }

        function retry(err) {
            if (err && err.code === 'EAGAIN') {
                // Could not obtain the lock, lets wait a bit
                return new Promise(function(resolve) {
                    setTimeout(resolve, self.timeout);
                })
                // Try to lock it again
                .then(lock);
            }
            return Promise.reject(err);
        }

    })

    // Close file descriptor on error
    .then(null, close.bind(this));

    function close(err) {
        if (this.fd) {
            return fs.close(this.fd)
            .then(function () {
                this.fd = undefined;
                return Promise.reject(err);
            });
        } else {
            return Promise.reject(err);
        }
    }
};

/**
 * TODO
 */
Lock.prototype.release = function() {
    if (--this.rc > 0) {
        return Promise.resolve();
    }

    if (! this.fd) {
        return Promise.reject('Nothing to release.');
    }

    return fs.flock(this.fd, 'un')

    // Close file descriptor
    .then(
        close.bind(this, null),
        close.bind(this)
    );

    function close(err) {
        return fs.close(this.fd)
        // Release file descritor
        .then(function () {
            this.fd = undefined;
        }.bind(this))
        // Throw error if this is a rejected promise
        .then(function () {
            if (err) {
                return Promise.reject(err);
            }
        });
    }

};

/**
 * TODO
 */
Lock.prototype.synchronized = function(callback) {
    return this.acquire().then(() => Promise.resolve().then(callback).then(
        result => this.release().then(() => result),
        reason => this.release().then(() => { throw reason; })
    ));
};

module.exports = Lock;
