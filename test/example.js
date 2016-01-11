var LibDploy = require('../'),
    Site     = LibDploy.Site,
    Role     = LibDploy.Role;

var site, role, host;

/**
 *
 *    DOESN'T WORK ANYMORE !!!!!!!!
 *
 **/

site = new Site('outcome/example/local', 'outcome/example/bare');
role = new Role('fixture/roles/example');

site.initialize()
.then(function() {
    return site.createHost('host');
})
.then(function(_host) {
    host = _host;
    return site.addHost(host);
})
.then(function() {
    return site.installRole(role, 'v1.0.0');
})
.then(function() {
    return host.setRole(role, 'v1.0.0', {});
})
.catch(function(err) {
    console.log('Example error:', err);
    console.log(err.stack);

    process.exit(1);
});
