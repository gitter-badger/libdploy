
.PHONY: all dev

all: clean dev

dev: build
	cd tmp/escaux; ansible-playbook -i "database.example.com," -c local site.yml

build: tmp fakerole
	@echo =====================================================================
	node example.js
	@echo =====================================================================
	tree tmp

fakerole: tmp
	mkdir -p tmp/roles/database
	git -C tmp/roles/database init
	touch tmp/roles/database/README
	git -C tmp/roles/database add README
	git -C tmp/roles/database commit -m "Initial commit"
	git -C tmp/roles/database checkout -b "v1.0.0"
	mkdir tmp/roles/database/tasks
	cp tasks.yml tmp/roles/database/tasks/main.yml
	git -C tmp/roles/database add tasks/main.yml
	git -C tmp/roles/database commit -m "Add tasks in version 1.0.0"
	git -C tmp/roles/database checkout "master"

tmp:
	mkdir -p tmp/

clean:
	rm -rf tmp/
