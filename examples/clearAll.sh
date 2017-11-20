#!/bin/bash
SCRIPT_PATH="`dirname \"$0\"`"

find $SCRIPT_PATH/docs -mindepth 2 -delete
find $SCRIPT_PATH/test -mindepth 2 -delete
find $SCRIPT_PATH/client -mindepth 2 -delete
find $SCRIPT_PATH/server -mindepth 2 -delete