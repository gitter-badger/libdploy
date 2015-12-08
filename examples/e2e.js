var libdploy = require('../');

var CLUSTER_PATH  = 'tmp/clusters/escaux',
    ROLE_PATH     = 'tmp/roles/database',
    ROLE_NAME     = 'database',
    ROLE_VERSION  = 'v1.0.0',
    ROLE2_PATH    = 'tmp/roles/monitoring',
    ROLE2_NAME    = 'monitoring',
    ROLE2_VERSION = 'v1.0.0',
    HOSTNAME      = 'database.example.com',
    HOST_RENAME   = 'db.example.com';

var host,
    locker  = new libdploy.FakeLocker(),
    role    = new libdploy.Role(ROLE_PATH),
    role2   = new libdploy.Role(ROLE2_PATH),
    cluster = new libdploy.Cluster(CLUSTER_PATH, locker);

// Initialize the cluster
cluster.initialize()

// List versions of role to install in the cluster
.then(function() {
    return role.versions();
})
.then(function(versions) {
    console.log('Role versions:', versions);
    return Promise.resolve();
})

// Install role in this cluster
.then(function() {
    return cluster.installRole(role, ROLE_VERSION);
})
.then(function() {
    console.log('Role installed !');
    return Promise.resolve();
})

// Reinstall role should not trigger errors
.then(function() {
    return cluster.installRole(role, ROLE_VERSION);
})
.then(function() {
    console.log('Role reinstalled !')
    return Promise.resolve();
})

// List installed roles
.then(function() {
    return cluster.roles();
})
.then(function(roles) {
    console.log('Installed roles:', roles);
    return Promise.resolve();
})


// Install second role in this cluster
.then(function() {
    return cluster.installRole(role2, ROLE2_VERSION);
})
.then(function() {
    console.log('Second role installed !');
    return Promise.resolve();
})

// List installed roles
.then(function() {
    return cluster.roles();
})
.then(function(roles) {
    console.log('Installed roles:', roles);
    return Promise.resolve();
})

// Update installed roles
.then(function() {
    return cluster.updateRoles();
})
.then(function() {
    console.log('Roles updated !');
    return Promise.resolve();
})

// Create a new host
.then(function() {
    return cluster.createHost(HOSTNAME);
})
.then(function(_host) {
    host = _host;
    console.log('Host created:', host);
    return Promise.resolve();
})

// Add created host in the cluster
.then(function() {
    return cluster.addHost(host);
})
.then(function() {
    console.log('Host added in cluster !');
    return Promise.resolve();
})

// Retrieve a Host object from its name
.then(function() {
    return cluster.host(HOSTNAME);
})
.then(function(host) {
    console.log('Host retrieve from name:', host);
    return Promise.resolve();
})

// Add role to the host with empty parameter set
.then(function() {
    return host.setRole(role, ROLE_VERSION, {});
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

// Set host variables
.then(function() {
    return host.setVariables({
        test: {
            key: 'Another one',
            number: 58
        },
        array: [
            'item',
            'second'
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

// Remove role from the cluster
.then(function() {
    return cluster.dropRole(role, ROLE_VERSION);
})
.then(function() {
    console.log('Role removed !');
    return Promise.resolve();
})

// List hosts
.then(function() {
    return cluster.hosts();
})
.then(function(hosts) {
    console.log('Hosts:', hosts);
    return Promise.resolve();
})

// Rename a host
.then(function() {
    return cluster.renameHost(host, HOST_RENAME);
})
.then(function(_host) {
    host = _host;
    console.log('Hosts moved !');
    return Promise.resolve();
})

// List hosts
.then(function() {
    return cluster.hosts();
})
.then(function(hosts) {
    console.log('Hosts:', hosts);
    return Promise.resolve();
})

// Remove a host
.then(function() {
    return cluster.removeHost(host);
})
.then(function() {
    console.log('Hosts removed !');
    return Promise.resolve();
})

// List hosts again
.then(function() {
    return cluster.hosts();
})
.then(function(hosts) {
    console.log('Hosts:', hosts);
    return Promise.resolve();
})

// Drop host
.then(function(hosts) {
    return cluster.dropHost(HOST_RENAME);
})
.then(function(hosts) {
    console.log('Hosts dropped !');
    return Promise.resolve();
})

.then(function() {
    console.log('Finished');
})
.catch(function(err) {
    console.log('Issue:', err, err.stack);
})
.finally(function() {
    // locker.unref();
});
