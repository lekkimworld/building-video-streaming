# building-video-streaming

## Configurations variables
* `SESSION_SECRET` (session secret, if not specified will be a random uuid)
* `NODE_ENV` (production | development)
* `AUTH_SECRET` (authentication secret)
* `VIDEO_PATH` (path to video folder)
* `REDIRECT_INSECURE` (set to 1 or `true` to redirect to https - also require `NODE_ENV` to be set to `production`)