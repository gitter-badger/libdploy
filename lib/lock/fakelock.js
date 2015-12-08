var util = require('util'),
    Lock = require('./lock.js'),
    Q    = require('q');

module.exports = FakeLock;

function FakeLock(client, params) {
    Lock.call(this);
}

// Inherits Lock
util.inherits(FakeLock, Lock);

FakeLock.prototype.acquire = function(key) {
    return Q.Promise.resolve();
};

FakeLock.prototype.release = function() {
    return Q.Promise.resolve();
};
