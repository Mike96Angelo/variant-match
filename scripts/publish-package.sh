#!/bin/bash

cp package*.json dist/
cp -r docs dist/
cp README.md dist/
cp LICENSE dist/
(cd dist && npm publish)
