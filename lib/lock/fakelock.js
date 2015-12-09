var util    = require('util'),
    Lock    = require('./lock.js'),
    Promise = require('../utils/dploypromise.js');

module.exports = FakeLock;

function FakeLock(client, params) {
    Lock.call(this);
}

// Inherits Lock
util.inherits(FakeLock, Lock);

FakeLock.prototype.acquire = function(key) {
    return Promise.resolve();
};

FakeLock.prototype.release = function() {
    return Promise.resolve();
};
