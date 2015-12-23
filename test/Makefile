# Subject: Test LibDploy library.
# Author: Raphael Medaer <raphael.medaer@straightforward.me>
# Date: December, 2015

.PHONY: all lock cluster clean

# Roles to generate
ROLE_FIXTURES=fixture/roles/database fixture/roles/monitoring


all: clean lock cluster

lock: fixture
	mocha -b lock.js

cluster: $(ROLE_FIXTURES) fixture/clusters
	mocha -b cluster.js

fixture:
	mkdir -p fixture

fixture/roles: fixture
	mkdir -p fixture/roles

fixture/clusters: fixture
	mkdir -p fixture/clusters

# Generate Role fixtures
$(ROLE_FIXTURES):
	# Initialize role directory
	mkdir -p $@
	git -C $@ init

	# Fill in master branch with a Readme file
	touch $@/README
	git -C $@ add README
	git -C $@ commit -m "Initial $@ commit"
	git -C $@ checkout -b "v1.0.0"

	# Fill in version 1.0.0 (branch v1.0.0) with main tasks file
	mkdir -p $@/tasks
	touch $@/tasks/main.yml
	git -C $@ add tasks/main.yml
	git -C $@ commit -m "Add tasks in version 1.0.0"

	# Come back to master
	git -C $@ checkout "master"

clean:
	rm -rf fixture
