#! /usr/bin/env sh

set -e
cd /usr/src/app || exit
touch .yarn.sha1
OLD_SHA=$(cat .yarn.sha1)
NEW_SHA=$(sha1sum yarn.lock)
if [ "$OLD_SHA" != "$NEW_SHA" ]; then
  echo "$NEW_SHA" > .yarn.sha1
  yarn
fi
yarn dev
