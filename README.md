# libdploy

This package contains Dploy library. It has been made in scope of Slidesk.
It's using Ansible in backend to manage and deploy software and configuration.
This package is a **library**, it should be used by a CLI or an API.

Dploy library manage Ansible configuration files. It implements a CRUD matrice
for every objects. There is 3 objects:

  * **Cluster** : A cluster is a group of hosts which depend each others.
  These hosts share modules and variables. The versioning management and
  the deployment processes will be gathered by cluster.
  * **Host** : A host represent a remote service which provides services.
  A host contains modules and variables.
  * **Role** : Called **module** in Slidesk, a role is a recipe which configure
  each parts of a service.

## How to ?

The following example explains how to create a cluster with a host and
install/add a role to them.

First create a **cluster** and initialize it :

```
var cluster = new Cluster('my/cluster/path');
cluster.initialize();
```

Then, create and add a **host** in it :

```
cluster.createHost('myhost')
.then(function(host) {
    cluster.addHost(host);
})
```

Even you already have a **role** installed, install it in **cluster** :

```
var role = new Role('my/remote/role');
cluster.installRole(role, 'v1.0.0');
```

And finally add this **role** to your **host** :

```
host.setRole(role, 'v1.0.0', {
    parameter: 'This is an example of parameter'
});
```

That's it ! You have your infrastructure.
