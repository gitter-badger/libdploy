module.exports = {
    Cluster:     require('./cluster.js'),
    Host:        require('./host.js'),
    Role:        require('./role.js'),
    Locker:      require('./lock/locker.js'),
    RedisLocker: require('./lock/redislocker.js'),
    FakeLocker:  require('./lock/fakelocker.js'),
};
