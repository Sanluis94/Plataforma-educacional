# syntax=docker/dockerfile:1.7
# Each build binds one public Firebase web configuration to one installation.
ARG NODE_IMAGE=node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30.5-alpine@sha256:56b8272e43a0525f67aed68d1e0794a712d10e3e45a563e118e9a77c817e6f86
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ src/
COPY public/ public/
COPY scripts/cloud/ scripts/cloud/
ARG KORTEX_SOURCE_REVISION
RUN --mount=type=secret,id=installation,required=true \
    KORTEX_SOURCE_REVISION="${KORTEX_SOURCE_REVISION}" node scripts/cloud/build-installation.mjs /run/secrets/installation

FROM ${NGINX_IMAGE} AS runtime
USER root
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/entrypoint.sh /opt/kortex/entrypoint.sh
COPY --from=build /app/.local/cloud-binding/installation-binding /opt/kortex/installation-binding
COPY --from=build /app/dist/ /usr/share/nginx/html/
RUN chmod 0555 /opt/kortex/entrypoint.sh && chmod 0444 /opt/kortex/installation-binding
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["/opt/kortex/entrypoint.sh"]
