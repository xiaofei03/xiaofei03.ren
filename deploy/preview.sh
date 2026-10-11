#!/bin/sh
set -eu
# The remote web service only listens on loopback. Traffic travels inside SSH.
exec ssh -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
  -i "$HOME/.ssh/id_ed25519_github_xiaofei03" \
  -L 127.0.0.1:5183:127.0.0.1:5183 ubuntu@49.234.27.200
