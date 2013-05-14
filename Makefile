REPORTER = spec

test:
	node ./test/mongo-test.js

bench:
	node benchmarks/benchmarks.js

.PHONY: test
