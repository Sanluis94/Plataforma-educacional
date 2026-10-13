#!/bin/sh
set -eu

# Public binding, not runtime replacement of Vite's compile-time configuration.
binding=/opt/kortex/installation-binding
expected_id=$(sed -n '1p' "$binding")
expected_project=$(sed -n '2p' "$binding")
expected_origin=$(sed -n '3p' "$binding")
expected_host=$(sed -n '4p' "$binding")
if [ -z "${KORTEX_INSTALLATION_ID:-}" ] || [ "$KORTEX_INSTALLATION_ID" != "$expected_id" ] || \
   [ -z "${KORTEX_FIREBASE_PROJECT_ID:-}" ] || [ "$KORTEX_FIREBASE_PROJECT_ID" != "$expected_project" ] || \
   [ -z "${KORTEX_PUBLIC_ORIGIN:-}" ] || [ "$KORTEX_PUBLIC_ORIGIN" != "$expected_origin" ]; then
  printf '%s\n' 'Instalação, projeto Firebase ou origem não correspondem à imagem compilada.' >&2
  exit 1
fi
if [ -z "$expected_host" ] || printf '%s' "$expected_host" | grep -q '[^a-z0-9.-]'; then
  printf '%s\n' 'Domínio compilado inválido.' >&2
  exit 1
fi
printf 'map $host $kortex_allowed_host { default 0; "%s" 1; }\n' "$expected_host" > /tmp/kortex-host.conf
if [ ! -r /usr/share/nginx/html/index.html ] || [ ! -r /usr/share/nginx/html/installation.json ]; then
  printf '%s\n' 'Artefato da instalação indisponível.' >&2
  exit 1
fi
nginx -t
exec nginx -g 'daemon off;'
