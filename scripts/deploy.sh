#!/bin/bash

TAG=$(git describe --tags --abbrev=0)

if [ -z "$TAG" ]; then
    echo "Error: No tag found"
    exit 1
fi

git push origin $TAG

echo "Building docker image with tag: $TAG"

docker buildx build --platform linux/amd64 -t git.chenmi.tech/chenmi/chenmi-tech:$TAG --provenance=false .

if [ $? -ne 0 ]; then
    echo "Error: Docker build failed"
    exit 1
fi

echo "Pushing docker image to registry"

docker push git.chenmi.tech/chenmi/chenmi-tech:$TAG

if [ $? -ne 0 ]; then
    echo "Error: Docker push failed"
    exit 1
fi

echo "Successfully published image with tag: $TAG"
