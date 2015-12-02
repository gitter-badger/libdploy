var YAMLFile = require('./yamlfile.js'),
    util     = require('util'),
    path     = require('path');

var HOSTNAME_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/

module.exports = Host;

/**
 * Object which represents a Host. It's a container which contains roles,
 * variables and configuration about a host.
 * @constructor
 * @param {string} file - Playbook file path of this host.
 */
function Host(file) {
    YAMLFile.call(this, file);
}

// Inherits YAMLFile
util.inherits(Host, YAMLFile);

/**
 * Validate hostname.
 * @param {string} hostname - Hostname to validate.
 * @return {boolean} True if hostname is valid, even false.
 */
Host.validate = function(hostname) {
    return HOSTNAME_REGEX.test(hostname);
};

/**
 * Get playbook path of this host.
 * @return {string} Playbook path.
 */
Host.prototype.path = function() {
    return this.file;
};

/**
 * Get name of this host.
 * @return {string} Hostname.
 */
Host.prototype.name = function() {
    return path.basename(this.file, '.yml');
};

/**
 * Initialize this host. It will overwrite the playbook with an empty
 * configuration.
 * @return {Promise}
 */
Host.prototype.initialize = function() {
    var self = this;

    // Initialize configuration file
    return self.write([{
        hosts: self.name(),
        include_vars: path.join('vars', self.name() + '.yml'),
    }]);
};

/**
 * Read variables of this host.
 * @return {Promise} Object within a Promise.
 */
Host.prototype.variables = function() {
    var self = this;

    // Read Host playbook to get variable file from "include_vars" statement
    return this.read()
    .then(function(config) {
        // Test if set
        if (! config[0] || ! config[0].include_vars) {
            return Promise.reject('Wrong formatted playbook');
        }

        // Read file and ignore errors (read(true))
        return new YAMLFile(
            path.resolve(self.file, '../../', config[0].include_vars))
                .read(true);
    });
};

/**
 * Set host variables.
 * @param {object} variables - Variables of this host.
 * @return {Promise}
 */
Host.prototype.setVariables = function(variables) {
    var self = this;

    // Read Host playbook to get variable file from "include_vars" statement
    return this.read()
    .then(function(config) {
        // Test if set
        if (! config[0] || ! config[0].include_vars) {
            return Promise.reject('Wrong formatted playbook');
        }

        // Write variables file
        return new YAMLFile(
            path.resolve(self.file, '../../', config[0].include_vars))
                .write(variables);
    });
};

Host.prototype.addRole = function(role, params) {

};
