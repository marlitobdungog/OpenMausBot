#!/bin/sh
set -eu

REGISTRY="asia-southeast1-docker.pkg.dev"
PROJECT="myassistant-440206"
REPOSITORY="docker-repo"
APP_NAME="openmausbot"
SERVICE="omb"
VERSION="$(cat VERSION)"
IMAGE="${REGISTRY}/${PROJECT}/${REPOSITORY}/${APP_NAME}-${SERVICE}:${VERSION}"
ENGINES="${ENGINES-@anthropic-ai/claude-code}"

if ! gcloud auth print-identity-token >/dev/null 2>&1; then
  gcloud auth login
fi

gcloud auth configure-docker "$REGISTRY"
docker build --platform linux/amd64 --build-arg "ENGINES=${ENGINES}" -t "$IMAGE" .
docker push "$IMAGE"
