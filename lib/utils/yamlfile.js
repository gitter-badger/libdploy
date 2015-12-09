var fs        = require('fs'),
    path      = require('path'),
    promisify = require('es6-promisify'),
    yaml      = require('js-yaml'),
    readFile  = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

module.exports = YAMLFile;

var ENCODING = 'utf-8';

function YAMLFile(file) {
    this.file = '';
    Object.defineProperty(this, 'file', {
        enumerable: false,
        value: file
    });
}

YAMLFile.prototype.read = function(ignoreErrors) {
    return readFile(this.file, ENCODING)
    .then(function(content) {
        return Promise.resolve(yaml.safeLoad(content));
    })
    .catch(function(err) {
        if (ignoreErrors) {
            // NOTE Should we notice something to a logger ?
            return Promise.resolve();
        } else {
            return Promise.reject(err);
        }
    });
};

YAMLFile.prototype.write = function(data) {
    return writeFile(this.file, yaml.safeDump(data), ENCODING);
};
