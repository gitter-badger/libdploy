# Subject: Test LibDploy library.
# Author: Raphael Medaer <raphael.medaer@straightforward.me>
# Date: December, 2015

.PHONY: all roles lock site infrastructure xample clean

# Roles to generate
ROLE_FIXTURES=fixture/roles/database fixture/roles/monitoring fixture/roles/example


all: clean lint lock site infrastructure example

lint:
	jshint -c ../.jshintrc ../**/*.js

lock: outcome
	mocha -b lock.js

site: outcome/site roles
	mocha -b site.js

infrastructure: outcome/infrastructure/local outcome/infrastructure/bare ../strategies
	mocha -b infrastructure.js

example: outcome/example roles
	node example.js

roles: $(ROLE_FIXTURES)

outcome:
	mkdir outcome

outcome/site: outcome
	mkdir outcome/site

outcome/infrastructure: outcome
	mkdir outcome/infrastructure

outcome/infrastructure/local: outcome/infrastructure
	mkdir outcome/infrastructure/local

outcome/infrastructure/bare: outcome/infrastructure
	mkdir outcome/infrastructure/bare

outcome/example: outcome
	mkdir outcome/example

fixture:
	mkdir fixture

fixture/roles: fixture
	mkdir fixture/roles

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
