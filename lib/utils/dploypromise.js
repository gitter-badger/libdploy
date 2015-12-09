/**
 * DployPromise inherits Promise and implements additional functions.
 * Thks to:
 *  - http://ibnrubaxa.blogspot.be/2014/07/how-to-inherit-native-promise.html
 *  - https://github.com/kriskowal/q/blob/v1/q.js#L1753
 *
 * @constructor
 * @see Promise
 * @extends Promise
 */
var DployPromise = function(executor) {
  var promise = new Promise(executor);
  promise.__proto__ = this.__proto__;
  return promise;
};

DployPromise.prototype = Object.create(Promise.prototype, {
    constructor: {
        value: DployPromise
    }
});

/**
 * Execute the callback even the Promise success or fail.
 */
DployPromise.prototype.finally = function(callback) {
    if (!callback || typeof callback.apply !== 'function') {
        throw new Error('Can\'t apply finally callback');
    }

    return this.then(function(value) {
        return callback.call(this).then(function() {
            return value;
        });
    }.bind(this), function(reason) {
        return callback.call(this).then(function() {
            throw reason;
        });
    }.bind(this));
};

DployPromise.all     = Promise.all;
DployPromise.cast    = Promise.cast;
DployPromise.reject  = Promise.reject;
DployPromise.resolve = Promise.resolve;

module.exports = DployPromise;
