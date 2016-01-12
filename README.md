# libdploy

This package contains Dploy library. It has been made in scope of Slidesk.
It's using Ansible in backend to manage and deploy softwares and configurations.
This package is a library, it MUST be used by a CLI or an API.

Dploy library contains the following classes:

  * **Infrastructure**: An inventory of every **Sites** own in this infrastructure.
  * **Site**: A group of **Hosts** that act in a common environment. It's sharing roles and variables.
  * **Host**: A host is a server configured and provisioned by [libdploy](http://slidesk.org/libdploy). This whole of resources provides services.

```
┌────────────────┐     owns    ┌──────┐    contains    ┌──────┐
│ Infrastructure ├────────────>│ Site ├───────────────>│ Host │
└────────────────┘1           n└───┬──┘1              n└──────┘
                                   │1
                                   │         uses      ┌──────┐
                                   └──────────────────>│ Role │
                                                      n└──────┘
```

## How to ?

The following example explains how to create a site with a host and
install/add a role to it.

First create a **site** and initialize it :

```
var site = new Site('/path/to/working/dir', '/path/to/bare/dir');
site.initialize();
```

Then, create and add a **host** :

```
site.createHost('myhost')
.then(function(host) {
    site.addHost(host);
})
```

Even you already have a **role** installed, install it on your **site** :

```
var role = new Role('my/remote/role');
site.installRole(role, 'v1.0.0');
```

And finally add this **role** to your **host** :

```
host.setRole(role, 'v1.0.0', {
    parameter: 'This is an example of parameter'
});
```

That's it ! You have your infrastructure ready for Ansible processes.


Made with ♥ by [Raphael Medaer](mailto:raphael.medaer@straightforward.me)
