#!/usr/bin/env bash
# Build the mockup and ship it to forge, which serves it statically at
# https://mockup.masy.family. The storybook dev server stays on this box —
# design.masy.family reaches it through the reverse SSH tunnel, so it is not
# published here.
set -euo pipefail

REMOTE="${REMOTE:-forge}"
TARGET="${TARGET:-/opt/apps/static/mockup}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

echo "==> building"
bun run build

echo "==> shipping to ${REMOTE}:${TARGET}"
rsync -az --delete "${ROOT}/dist/" "${REMOTE}:${TARGET}/"

echo "==> checking"
code=$(curl -s -o /dev/null -w '%{http_code}' --retry 3 --retry-delay 2 \
    --retry-all-errors --max-time 20 https://mockup.masy.family/ || echo "000")
echo "https://mockup.masy.family -> HTTP ${code}"
[ "$code" = "200" ] || { echo "unexpected status — check forge"; exit 1; }
