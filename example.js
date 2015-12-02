var Cluster = require('./').Cluster;

var host;

var c = new Cluster('tmp/escaux');

c.initialize()
.then(function() {
    return c.createHost('database.example.com');
})
.then(function(_host) {
    host = _host;
    return c.addHost(host);
})
.then(function() {
    return c.hosts();
})
.then(function(hosts) {
    console.log(hosts);
    return c.removeHost(host);
})
.then(function() {
    return c.hosts();
})
.then(function(hosts) {
    console.log(hosts);
    return c.destroyHost(host.name());
})
.then(function() {
    console.log('Finished');
})
.catch(function(err) {
    console.log(err.stack);
})
