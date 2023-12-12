#!/bin/bash

set -eo pipefail

# Project dir
basedir="$(pwd)"

# [TODO] This is workaround for VSCode to override typings.
# So, to make VSCode happy, all types should at 'node_modules/@types'.
function link_typings {
    pushd node_modules/@types >/dev/null
    for f in $(ls ../../src/types); do rm -rf $f; ln -s ../../src/types/$f; done
    popd >/dev/null
}

echo 'POST-INSTALL: Link typings "node_modules/@types" => "src/types"'
link_typings
