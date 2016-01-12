# Subject: Test LibDploy library.
# Author: Raphael Medaer <raphael.medaer@straightforward.me>
# Date: December, 2015

.PHONY: all roles lock site example clean

# Roles to generate
ROLE_FIXTURES=fixture/roles/database fixture/roles/monitoring fixture/roles/example


all: clean lint lock site example

lint:
	jshint -c ../.jshintrc ../**/*.js

lock: outcome
	mocha -b lock.js

site: outcome/site roles
	mocha -b site.js

example: outcome/example roles
	node example.js

roles: $(ROLE_FIXTURES)

outcome:
	mkdir -p outcome

outcome/site: outcome
	mkdir -p outcome/site

outcome/example: outcome
	mkdir -p outcome/example

fixture:
	mkdir -p fixture

fixture/roles: fixture
	mkdir -p fixture/roles

# Generate Role fixtures
$(ROLE_FIXTURES):
	# Initialize role directory
	mkdir -p $@
	git -C $@ init

	# Set default user for this Git repository
	git -C $@ config user.email "dev@slidesk.org"
	git -C $@ config user.name "Slidesk Developer"

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
	rm -rf fixture/roles
	rm -rf outcome
