var util      = require('util'),
    FakeLock  = require('./fakelock.js'),
    Locker    = require('./locker.js');

module.exports = FakeLocker;

function FakeLocker(options) {
    Locker.call(this);
}

// Inherits Locker
util.inherits(FakeLocker, Locker);

FakeLocker.prototype.createLock = function(key) {
    return new FakeLock();
};
