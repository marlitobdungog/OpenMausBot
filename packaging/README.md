# appctl packaging

This package installs the OpenMausBot server with a plain-HTTP Caddy socket
proxy. Put Traefik or Tailscale in front to handle external routing and TLS.
The proxy listens on `OMB_HTTP_PORT` (default `8081`) and is bound to
`127.0.0.1` by default.

If the proxy runs in another container, configure `OMB_BIND_ADDRESS` so it can
reach the host port, and set `OMB_TRUSTED_PROXY_CIDRS` to the proxy addresses
Caddy sees. When that proxy terminates TLS, also set `OMB_PUBLIC_URL` to its
HTTPS address and `OMB_HTTPS_HOST` to the hostname. A non-loopback bind
requires an explicit trusted-proxy range.

Build the installer package with:

```sh
appctl package build --path .
```

To publish an appctl release that uses the upstream server image pinned in
`release.json`:

```sh
make release
```

This publishes the installer release only; it does not build or push a Docker
image. It requires the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
variables required by appctl to publish the release. On the host, Compose pulls
the pinned base image from GitHub Container Registry and locally builds
`openmausbot-marlito` with the CLI packages in `ENGINES` (GitHub Copilot by
default). Set `ENGINES` in `/etc/openmausbot/.env` to add or change packages.

Install on a remote host with:

```sh
appctl app install --manifest-file packaging/package.json --target remote --ip user@host
```

The application data stays in Docker's named `openmausbot_data` volume across
container updates. Do not remove it with `docker compose down -v` unless you
intend to delete the data.
