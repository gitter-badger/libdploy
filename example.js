var Cluster = require('./').Cluster;

var host;
var hostname = 'database.example.com';

var c = new Cluster('tmp/escaux');

c.initialize()

// Create a new host
.then(function() {
    return c.createHost(hostname);
})
.then(function(_host) {
    host = _host;
    return Promise.resolve();
})

// Add a host in the cluster
.then(function() {
    return c.addHost(host);
})

// Retrieve a Host object from its name
.then(function() {
    return c.host(host.name());
})

// Set host variables
.then(function() {
    return host.setVariables({
        test: {
            key: 'value',
            number: 42
        },
        array: [
            'item'
        ]
    });
})

// Get host variables
.then(function() {
    return host.variables();
})
.then(function(variables) {
    console.log('Variables:', variables);
    return Promise.resolve();
})


.then(function() {
    // return Promise.reject('Pause');
    return c.hosts();
})
.then(function(hosts) {
    console.log('Hosts:', hosts);
    return c.removeHost(host);
})
.then(function() {
    return c.hosts();
})
.then(function(hosts) {
    console.log('Hosts:', hosts);
    return c.destroyHost(host.name());
})
.then(function() {
    console.log('Finished');
})
.catch(function(err) {
    console.log('Issue:', err.stack);
})
