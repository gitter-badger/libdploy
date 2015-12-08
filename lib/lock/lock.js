module.exports = Lock;

function Lock() {
}

Lock.prototype.acquire = function(key) {
    throw Error('Not implemented');
};

Lock.prototype.release = function() {
    throw Error('Not implemented');
};
