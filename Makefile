REPORTER = spec

test: 
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--ui bdd \
		--reporter $(REPORTER)

.PHONY: test