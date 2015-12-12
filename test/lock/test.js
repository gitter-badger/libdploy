var FlockLocker = require('../../lib/lock/flocklocker.js');

var DIRECTORY = 'lock';

var locker = new FlockLocker({ path: DIRECTORY, retry: 0, timeout: 0 });

var alphaLock = locker.createLock(),
    betaLock = locker.createLock(),
    alphaKey = 'ALPHA';

describe('Unlock nothing', function() {
    it ('#it should throw an error upon release a free lock', function () {
        return alphaLock.release()
        .then(
            function () {
                return Promise.reject('You should not be able to release a free lock');
            },
            function (err) {
                // Expected result here
            }
        )
    });
});


describe('Lock & Release & Release', function () {
    it('#it should acquire a lock', function () {
        return alphaLock.acquire(alphaKey);
    });
    it ('#it should release the lock', function () {
        return alphaLock.release();
    });
    it ('#it should throw an error upon release a free lock', function () {
        return alphaLock.release()
        .then(
            function () {
                return Promise.reject('You should not be able to release a free lock');
            },
            function () {
                // Expected result here
            }
        );
    });
});

describe('Lock & Unlock', function() {
    it('#it should acquire a lock', function () {
        return alphaLock.acquire(alphaKey);
    });
    it ('#it should release the lock', function () {
        return alphaLock.release();
    });
});

describe('Lock & Unlock & Unlock', function () {
    it('#it should acquire a lock', function () {
        return alphaLock.acquire(alphaKey);
    });
    it ('#it should release the lock', function () {
        return alphaLock.release();
    });
    it('#it should acquire a lock', function () {
        return alphaLock.acquire(alphaKey);
    });
    it ('#it should release the lock', function () {
        return alphaLock.release();
    });
});


describe('Lock & Same Lock & Different Lock & Release', function () {
    it('#it should acquire a lock', function () {
        return alphaLock.acquire(alphaKey);
    });
    it('#the different should fail to acquire the lock', function () {
        return alphaLock.acquire(alphaKey)
        .then(
            function () {
                return Promise.reject('It should fail to obtain the lock');
            },
            function () {
                // Expected result here
            }
        )
    });
    it('#a different lock object should fail to acquire the lock', function () {
        return betaLock.acquire(alphaKey)
        .then(
            function () {
                return Promise.reject('It should fail to obtain the lock');
            },
            function () {
                // Expected result here
            }
        )
    });
    it ('#it should release the lock', function () {
        return alphaLock.release();
    });
    it ('#a different lock should be able to acquire the lock', function () {
        return betaLock.acquire(alphaKey);
    });
    it ('#it should release the lock', function () {
        return betaLock.release();
    });

});





