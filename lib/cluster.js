var util = require('util'),
    Site = require('./site.js');

module.exports = Cluster;

var CLUSTER_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;

function Cluster(directory) {
    Site.call(this, directory);
}

/*
 * Validate cluster name.
 * @param {string} name - Site name to validate.
 * @return {boolean} True if cluster name is valid, even false.
 */
Cluster.validate = function(name) {
   return CLUSTER_REGEX.test(name);
};

util.inherits(Cluster, Site);
