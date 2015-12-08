var util         = require('util'),
    libredislock = require('redislock'),
    Lock         = require('./lock.js');

module.exports = RedisLock;

function RedisLock(client, params) {
    Lock.call(this);

    this.lock = libredislock.createLock(client, params);
}

// Inherits Lock
util.inherits(RedisLock, Lock);

RedisLock.prototype.acquire = function(key) {
    return this.lock.acquire(key);
};

RedisLock.prototype.release = function() {
    return this.lock.release();
};
