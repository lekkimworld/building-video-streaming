#!/bin/sh
docker run \
    --rm \
    -it \
    --env-file ./.env \
    -p 8080:8080 \
    lekkim/building-video-streaming  