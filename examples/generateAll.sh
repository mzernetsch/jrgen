#!/bin/bash
SCRIPT_PATH="`dirname \"$0\"`"
JRGEN_PATH=$SCRIPT_PATH/../jrgen.js
SCHEMA_PATH=${1:-$SCRIPT_PATH"/ExampleAPI.schema.json"}

#docs
node $JRGEN_PATH docs -f html -o $SCRIPT_PATH/docs/html $SCHEMA_PATH
node $JRGEN_PATH docs -f md -o $SCRIPT_PATH/docs/md $SCHEMA_PATH
node $JRGEN_PATH docs -f gitbook -o $SCRIPT_PATH/docs/gitbook $SCHEMA_PATH

#test
node $JRGEN_PATH test -f jasmine -o $SCRIPT_PATH/test/jasmine $SCHEMA_PATH

#client
node $JRGEN_PATH client -f es6 -o $SCRIPT_PATH/client/es6 $SCHEMA_PATH
node $JRGEN_PATH client -f ts -o $SCRIPT_PATH/client/ts $SCHEMA_PATH

#server
node $JRGEN_PATH server -f nodejs -o $SCRIPT_PATH/server/nodejs $SCHEMA_PATH
