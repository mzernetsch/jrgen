#!/bin/bash
schema=${1:-"./examples/ExampleAPI.schema.json"}

#docs
node ./jrgen.js docs -f html -o ./examples/docs/html $schema
node ./jrgen.js docs -f md -o ./examples/docs/md $schema
node ./jrgen.js docs -f gitbook -o ./examples/docs/gitbook $schema

#test
node ./jrgen.js test -f jasmine -o ./examples/test/jasmine $schema

#client
node ./jrgen.js client -f es6 -o ./examples/client/es6 $schema
node ./jrgen.js client -f ts -o ./examples/client/ts $schema

#server
node ./jrgen.js server -f nodejs -o ./examples/server/nodejs $schema
