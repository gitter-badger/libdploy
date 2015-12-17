module.exports = Lock;

function Lock() {
    if (!(this instanceof Lock) || this.constructor === Lock) {
        throw Error('Inavlid usage of "Lock" class.');
    }
}

Lock.prototype.acquire = function(key) {
    throw Error('Not implemented');
};

Lock.prototype.release = function() {
    throw Error('Not implemented');
};

Lock.prototype.synchronized = function (key, callback) {
    return this.aquire(key).then(() => Promise.resolve().then(callback).then(
        result => this.release().then(() => result),
        reason => this.release().then(() => { throw reason; })
    ));
};
