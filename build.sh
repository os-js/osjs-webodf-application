#!/usr/bin/env bash
set -e

npm run eslint
npm run stylelint

mkdir -p dist

rm -rf dist/*
rm -rf build

git submodule init
git submodule update --remote

mkdir -p build
pushd build
  cmake ../WebODF
  make webodf.js-target
popd

NODE_ENV=production npm run build
