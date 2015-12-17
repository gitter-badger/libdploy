var util    = require('util'),
    Lock    = require('./lock.js');

module.exports = FakeLock;

function FakeLock() {
    Lock.call(this);
}

// Inherits Lock
util.inherits(FakeLock, Lock);

FakeLock.prototype.acquire = function() {
    return Promise.resolve();
};

FakeLock.prototype.release = function() {
    return Promise.resolve();
};
