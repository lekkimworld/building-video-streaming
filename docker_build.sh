#!/bin/sh
VERSION=`cat package.json| jq ".version" -r`
GITCOMMIT=`git rev-parse --short HEAD`
IFS="." read -a VERSION_SPLIT <<< "$VERSION"
echo "Version, full: $VERSION"
echo "Version, major: ${VERSION_SPLIT[0]}"
echo "Version, minor: ${VERSION_SPLIT[1]}"
echo "Version, patch: ${VERSION_SPLIT[2]}"
echo "Commit: $GITCOMMIT"

docker build . \
    --build-arg APP_GITCOMMIT=$GITCOMMIT \
    --build-arg APP_VERSION=$VERSION \
    --tag lekkim/building-video-streaming:latest \
    --tag lekkim/building-video-streaming:${VERSION_SPLIT[0]} \
    --tag lekkim/building-video-streaming:${VERSION_SPLIT[0]}.${VERSION_SPLIT[1]} \
    --tag lekkim/building-video-streaming:${VERSION_SPLIT[0]}.${VERSION_SPLIT[1]}.${VERSION_SPLIT[2]}
