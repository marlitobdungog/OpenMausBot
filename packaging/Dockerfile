ARG BASE_IMAGE
FROM ${BASE_IMAGE}
USER root
ARG ENGINES="@github/copilot"
RUN if [ -n "$ENGINES" ]; then npm install -g $ENGINES; fi
USER maus
