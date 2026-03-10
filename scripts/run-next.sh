#!/usr/bin/env bash
set -euo pipefail

resolve_realpath() {
  node -e 'const path = require("path"); process.chdir(path.resolve(process.argv[1])); process.stdout.write(process.cwd());' "$1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(resolve_realpath "$SCRIPT_DIR/..")"

cd "$ROOT_DIR"
export PWD="$ROOT_DIR"
export INIT_CWD="$ROOT_DIR"
export npm_config_local_prefix="$ROOT_DIR"
export npm_package_json="$ROOT_DIR/package.json"

if [ "$#" -eq 0 ]; then
  echo "사용법: bash scripts/run-next.sh <next-command> [args...]"
  exit 1
fi

NEXT_COMMAND="$1"
shift

if [ -f "$ROOT_DIR/node_modules/next/dist/bin/next" ]; then
  NEXT_BIN_KIND="node"
  NEXT_BIN="$ROOT_DIR/node_modules/next/dist/bin/next"
elif command -v next >/dev/null 2>&1; then
  NEXT_BIN_KIND="binary"
  NEXT_BIN="$(command -v next)"
elif command -v npx >/dev/null 2>&1; then
  NEXT_BIN_KIND="npx"
  NEXT_BIN="npx"
else
  echo "next 실행기를 찾지 못했습니다."
  echo "pnpm install --dir '$ROOT_DIR'를 먼저 실행하세요."
  exit 1
fi

case "$NEXT_COMMAND" in
  dev|build|start|export)
    if [ "$NEXT_BIN_KIND" = "npx" ]; then
      exec npx next "$NEXT_COMMAND" "$@"
    fi
    if [ "$NEXT_BIN_KIND" = "node" ]; then
      exec node "$NEXT_BIN" "$NEXT_COMMAND" "$@"
    fi
    exec "$NEXT_BIN" "$NEXT_COMMAND" "$@"
    ;;
  *)
    if [ "$NEXT_BIN_KIND" = "npx" ]; then
      exec npx next "$NEXT_COMMAND" "$@"
    fi
    if [ "$NEXT_BIN_KIND" = "node" ]; then
      exec node "$NEXT_BIN" "$NEXT_COMMAND" "$@"
    fi
    exec "$NEXT_BIN" "$NEXT_COMMAND" "$@"
    ;;
esac
