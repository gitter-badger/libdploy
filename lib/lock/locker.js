module.exports = Locker;

function Locker() {
}

/**
 * Create a lock object.
 * @see {Lock}
 * @return {Lock} An object which inherits from Lock.
 */
Locker.prototype.createLock = function() {
    throw Error('Not implemented');
};
