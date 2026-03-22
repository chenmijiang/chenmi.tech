#!/bin/bash

set -euo pipefail

if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

TAG=$(git describe --tags --abbrev=0)

if [ -z "$TAG" ]; then
    echo "Error: No tag found"
    exit 1
fi

git push origin $TAG

echo "Building docker image with tag: $TAG"

docker buildx build \
    --platform linux/amd64 \
    --build-arg IPC="${IPC:-}" \
    --build-arg ICPLINK="${ICPLINK:-}" \
    -t git.chenmi.tech/chenmi/chenmi-tech:$TAG \
    --provenance=false \
    .

echo "Pushing docker image to registry"

docker push git.chenmi.tech/chenmi/chenmi-tech:$TAG

echo "Successfully published image with tag: $TAG"
