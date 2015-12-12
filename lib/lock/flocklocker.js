var util      = require('util'),
    Locker    = require('./locker.js'),
    FlockLock = require('./flocklock.js');

module.exports = FlockLocker;

function FlockLocker(params) {
    Locker.call(this);

    this.params = params;
}

// Inherits Locker
util.inherits(FlockLocker, Locker);

FlockLocker.prototype.createLock = function() {
    return new FlockLock(this.params);
};

