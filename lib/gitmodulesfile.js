/**
 * Why this file ???
 * Because libgit2 doesn't allow to remove Git Modules, we have to do it
 * manually. It means:
 *  - Delete the repository directory.
 *  - Remove the reference of it from ".gitmodules" file.
 *
 * The file ".gitmodules" is NOT a regular INI file. Section can contains
 * characters such as `"` or `'`. For this reason, we cannot use a regular
 * INI library. This class rewrite it ...
 *
 * A better solution SHOULD be to write it in libgit2 and wrap it in nodegit.
 *
 * Special thanks to @shockie for node-iniparser for inspiration.
 * @see https://github.com/shockie/node-iniparser
 */
var path      = require('path'),
    fs        = require('fs'),
    promisify = require('es6-promisify'),
    readFile  = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

var ENCODING        = 'utf-8',
    REGEX_SECTION   = /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    REGEX_PARAM     = /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
    REGEX_COMMENT   = /^\s*;.*$/,
    REGEX_SUBMODULE = /^(submodule "(.*)")$/;

module.exports = GitModulesFile;

function GitModulesFile(file) {
    this.data = {};

    Object.defineProperty(this, 'file', {
        enumerable: false,
        value: path.resolve(file),
    });
    Object.defineProperty(this, 'data', {
        enumerable: false,
    });
}

/**
 * Open and parse the file
 * @return {Promise}
 */
GitModulesFile.prototype.open = function() {
    var self = this;

    // Read and parse file
    return readFile(self.file, ENCODING)
    .then(function(content) {
        self.data = parse(content);
        return Promise.resolve();
    });
};

/**
 * List modules.
 */
GitModulesFile.prototype.list = function() {
    var modules = [];

    for (var key in this.data) {
        if (REGEX_SUBMODULE.test(key)) {
            modules.push(key.match(REGEX_SUBMODULE)[2]);
        }
    }

    return modules;
};

/**
 * Remove a Git module.
 * @param {string} mod - Module to remove.
 */
GitModulesFile.prototype.remove = function(mod) {
    delete this.data['submodule "' + mod + '"'];
};

/**
 * Overwrite ".gitmodules" file.
 * @return {Promise}
 */
GitModulesFile.prototype.write = function() {
    var content = '';

    for (var key in this.data) {
        content += '[' + key + ']\n';
        for (var subkey in this.data[key]) {
            content += '\t' + subkey + ' = ' + this.data[key][subkey] + '\n';
        }
    }

    return writeFile(this.file, content, ENCODING);
};

// Parse data from pseudo INI file from:
// https://github.com/shockie/node-iniparser/blob/master/lib/node-iniparser.js
function parse(data) {
    var value = {};
    var lines = data.split(/\r\n|\r|\n/);
    var section = null;

    lines.forEach(function(line) {
        // Test comment line
        if(REGEX_COMMENT.test(line)){
            return;
        }
        // Test parameter line
        else if (REGEX_PARAM.test(line)) {
            var match = line.match(REGEX_PARAM);
            if (section) {
                value[section][match[1]] = match[2];
            } else {
                value[match[1]] = match[2];
            }
        }
        // Test section line
        else if (REGEX_SECTION.test(line)) {
            var match = line.match(REGEX_SECTION);
            // NOTE Tweak, tweak, tweak
            if (typeof value[match[1]] !== 'object') {
                value[match[1]] = {};
            }
            section = match[1];
        }

        else if (line.length == 0 && section) {
            section = null;
        };
    });

    return value;
}
