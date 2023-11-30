#!/bin/sh
docker run \
    --rm \
    -it \
    -v /Users/mheisterberg/Programming/repos/unifi-snapshot/output:/data \
    -p 8080:8080 \
    lekkim/building-video-streaming  