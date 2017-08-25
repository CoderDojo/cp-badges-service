#! /usr/bin/env sh
set -e
cd /usr/src/app || exit
touch .pkg.sha1
OLD_SHA=$(cat .pkg.sha1)
NEW_SHA=$(sha1sum package.json)
if [ "$OLD_SHA" != "$NEW_SHA" ]; then
  echo "$NEW_SHA" > .pkg.sha1
  npm install
fi
npm run dev
