# libdploy

This package contains Dploy libraries. It has been made in scope of Slidesk
project which use Ansible in backend to manage and deploy software and
configuration. Dploy manage Ansible configuration files. This package should
be used by a CLI or an API.

## Architecture

```
Cluster
  - Hosts
     - Roles instances
     - Variables
  - Roles
  - Group variables
```
