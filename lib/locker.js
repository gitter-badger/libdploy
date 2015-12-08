var redis     = require('redis'),
    redislock = require('redislock');

module.exports = Locker;

var instance = null;

function Locker() {
    this.client = redis.createClient();
    // this.client.unref();

    this.params = {
        timeout: 10000,
        retries: 3,
        delay: 100
    };
}

Locker.prototype.createLock = function() {
    return redislock.createLock(this.client, this.params);
};

Locker.prototype.unref = function() {
    this.client.unref();
};

Locker.initialize = function() {
    instance = new Locker();
};

Locker.getInstance = function() {
    if (! instance) {
        Locker.initialize();
    }

    return instance;
};
