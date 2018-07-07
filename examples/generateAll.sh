#!/bin/bash
set -e

SCRIPT_PATH="`dirname \"$0\"`"
JRGEN_PATH=$SCRIPT_PATH/../jrgen.js
SCHEMA_PATH=${1:-$SCRIPT_PATH"/ExampleAPI.schema.json"}

#docs
node $JRGEN_PATH docs/html -o $SCRIPT_PATH/docs/html $SCHEMA_PATH
node $JRGEN_PATH docs/md -o $SCRIPT_PATH/docs/md $SCHEMA_PATH
node $JRGEN_PATH docs/gitbook -o $SCRIPT_PATH/docs/gitbook $SCHEMA_PATH

#test
node $JRGEN_PATH test/jasmine -o $SCRIPT_PATH/test/jasmine $SCHEMA_PATH

#client
node $JRGEN_PATH client/es6 -o $SCRIPT_PATH/client/es6 $SCHEMA_PATH
node $JRGEN_PATH client/ts -o $SCRIPT_PATH/client/ts $SCHEMA_PATH

#server
node $JRGEN_PATH server/nodejs -o $SCRIPT_PATH/server/nodejs $SCHEMA_PATH

#spec
node $JRGEN_PATH spec/postman -o $SCRIPT_PATH/spec/postman $SCHEMA_PATH