var Cluster = require('./').Cluster;
var Role = require('./').Role;

var host;
var hostname = 'database.example.com';
var roleversion = 'v1.0.0';

var role = new Role('tmp/roles/database');

var c = new Cluster('tmp/escaux');

c.initialize()

// List versions a role to install in the cluster
.then(function() {
    return role.versions();
})
.then(function(versions) {
    console.log('Role versions:', versions);
    return Promise.resolve();
})

// Install role in this cluster
.then(function() {
    return c.installRole(role, roleversion);
})
.then(function() {
    console.log('Role installed ...');
    return Promise.resolve();
})

// Reinstall role should not trigger errors
.then(function() {
    return c.installRole(role, roleversion);
})

// List installed roles
.then(function() {
    return c.roles();
})
.then(function(roles) {
    console.log('Roles:', roles);
    return Promise.resolve();
})

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

// Add role to the host
.then(function() {
    return host.setRole(role, roleversion, {});
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
    return Promise.reject('Pause');
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
