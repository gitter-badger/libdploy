var util      = require('util'),
    redis     = require('redis'),
    Locker    = require('./locker.js'),
    RedisLock = require('./redislock.js');

module.exports = RedisLocker;

function RedisLocker(options) {
    Locker.call(this);

    options = options ? options : {};

    this.client = redis.createClient(
        options.connection ? options.connection : null);

    this.params = {
        timeout: options.timeout ? options.timeout : 10000,
        retries: options.retry ? options.retry : 3,
        delay:   options.delay ? options.delay : 100,
    };
}

// Inherits Locker
util.inherits(RedisLocker, Locker);

RedisLocker.prototype.createLock = function() {
    return new RedisLock(this.client, this.params);
};

RedisLocker.prototype.unref = function() {
    this.client.unref();
};
