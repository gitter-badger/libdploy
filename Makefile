
.PHONY: all dev

all: dev

dev:
	rm tmp/ -rf
	mkdir tmp/
	@echo =====================================================================
	/usr/bin/node example.js
	@echo =====================================================================
	tree tmp
