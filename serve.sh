#!/usr/bin/env bash
# Serves this folder so the overlay can talk to Twitch.
# Browsers block API calls on file:// URLs, so a local server is required.
cd "$(dirname "$0")"
PORT="${1:-8080}"
if command -v python3 >/dev/null 2>&1; then exec python3 serve.py "$PORT"
elif command -v python  >/dev/null 2>&1; then exec python  serve.py "$PORT"
elif command -v npx     >/dev/null 2>&1; then
  echo "  Python not found — falling back to npx serve on port $PORT"
  exec npx --yes serve -l "$PORT" .
else
  echo "ERROR: Need Python 3 or Node installed." >&2; exit 1
fi
