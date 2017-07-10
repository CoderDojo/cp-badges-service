#! /usr/bin/env sh
cd /usr/src/app || exit
npm install
nodemon service.js
