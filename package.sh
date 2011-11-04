#!/bin/sh

rm -rf bin/
zip synctab -x package.sh -r *
mkdir bin
mv synctab.zip bin/synctab.zip
cp bin/synctab.zip bin/synctab.crx

echo 'SyncTab packaged.'
