
.PHONY: all e2e inspect
all: clean e2e inspect

inspect: tmp
	tree tmp

# End to end example
e2e: e2e.js tmp/roles/database tmp/clusters
	node e2e.js
	-cd tmp/clusters/escaux; ansible-playbook -i "database.example.com," -c local site.yml

# Fake role "Database"
tmp/roles/database: tmp/roles
	mkdir tmp/roles/database
	git -C tmp/roles/database init
	touch tmp/roles/database/README
	git -C tmp/roles/database add README
	git -C tmp/roles/database commit -m "Initial commit"
	git -C tmp/roles/database checkout -b "v1.0.0"
	mkdir tmp/roles/database/tasks
	cp tasks_example.yml tmp/roles/database/tasks/main.yml
	git -C tmp/roles/database add tasks/main.yml
	git -C tmp/roles/database commit -m "Add tasks in version 1.0.0"
	git -C tmp/roles/database checkout "master"

tmp/roles: tmp
	mkdir tmp/roles

tmp/clusters: tmp
	mkdir tmp/clusters

# Temporary directory
tmp:
	mkdir -p tmp/

# Clean
clean:
	rm -rf tmp/
