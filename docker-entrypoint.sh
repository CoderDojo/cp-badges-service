#! /usr/bin/env sh
cd /usr/src/app || exit
if [ ! -d "node_modules" ]; then
  npm install
fi
nodemon service.js
