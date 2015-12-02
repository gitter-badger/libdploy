var yaml = require('js-yaml'),
    path = require('path'),
    fs = require('fs'),
    promisify = require('es6-promisify'),
    readFile = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

module.exports = Playbook;

var ENCODING = 'utf-8';

function Playbook(file) {
    Object.defineProperty(this, 'file', {
        enumerable: false,
        value: file
    });
}

Playbook.prototype.read = function() {
    return readFile(this.file, ENCODING)
    .then(function(content) {
        return Promise.resolve(yaml.safeLoad(content));
    });
};

Playbook.prototype.write = function(data) {
    return writeFile(this.file, yaml.safeDump(data), ENCODING);
};
