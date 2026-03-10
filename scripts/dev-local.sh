#!/usr/bin/env bash
set -euo pipefail

resolve_realpath() {
  node -e 'const path = require("path"); process.chdir(path.resolve(process.argv[1])); process.stdout.write(process.cwd());' "$1"
}

ROOT_DIR="$(resolve_realpath "$(dirname "${BASH_SOURCE[0]}")/..")"
API_DIR="$(resolve_realpath "${ROOT_DIR}/../RBYE-API")"

API_PORT="${RBYE_API_PORT:-5003}"
FRONTEND_PORT="${RBYE_FRONTEND_PORT:-5004}"
FRONTEND_HOST="${RBYE_FRONTEND_HOST:-127.0.0.1}"
PORT_SCAN_RANGE="${RBYE_PORT_SCAN_RANGE:-20}"
AUTO_KILL="${RBYE_AUTO_KILL:-1}"
AUTO_SCAN="${RBYE_AUTOSCAN:-0}"
API_WATCH="${RBYE_API_WATCH:-0}"

if [ ! -d "$API_DIR" ]; then
  echo "RBYE-API 폴더를 찾을 수 없습니다: $API_DIR"
  exit 1
fi

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P -t 2>/dev/null | tr '\n' ' ' | sed 's/ $//' || true
  else
    echo ""
  fi
}

is_port_in_use() {
  local port="$1"
  [ -n "$(port_pids "$port")" ]
}

kill_port_holders() {
  local port="$1"
  local pids
  pids="$(port_pids "$port")"
  if [ -z "$pids" ]; then
    return 0
  fi

  echo "[$port] 포트 점유 프로세스 강제 종료: $pids"
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" || true
    fi
  done
  sleep 1
}

find_free_port() {
  local port="$1"
  local role="$2"
  local max_port=$((port + PORT_SCAN_RANGE))

  while [ "$port" -le "$max_port" ]; do
    if ! is_port_in_use "$port"; then
      echo "$port"
      return 0
    fi

    if [ "$AUTO_KILL" = "1" ]; then
      kill_port_holders "$port"
      if ! is_port_in_use "$port"; then
        echo "$port"
        return 0
      fi
    fi

    echo "${role} 포트 $port 사용 중, 다음 포트로 전환" >&2
    port=$((port + 1))
  done

  return 1
}

if [ "$AUTO_SCAN" = "1" ]; then
  if ! API_PORT="$(find_free_port "$API_PORT" "API")"; then
    echo "오류: API 사용 가능한 포트를 찾지 못했습니다. 현재 시작 포트=$API_PORT, 스캔 범위=$PORT_SCAN_RANGE"
    exit 1
  fi

  if ! FRONTEND_PORT="$(find_free_port "$FRONTEND_PORT" "프론트")"; then
    echo "오류: Frontend 사용 가능한 포트를 찾지 못했습니다. 현재 시작 포트=$FRONTEND_PORT, 스캔 범위=$PORT_SCAN_RANGE"
    exit 1
  fi
else
  if is_port_in_use "$API_PORT" && [ "$AUTO_KILL" != "1" ]; then
    echo "오류: API 포트 $API_PORT 가 이미 사용 중입니다."
    echo "RBYE_AUTOSCAN=1 또는 RBYE_API_PORT 변경 후 다시 실행하세요."
    exit 1
  elif [ "$AUTO_KILL" = "1" ]; then
    kill_port_holders "$API_PORT"
  fi

  if is_port_in_use "$FRONTEND_PORT" && [ "$AUTO_KILL" != "1" ]; then
    echo "오류: 프론트 포트 $FRONTEND_PORT 가 이미 사용 중입니다."
    echo "RBYE_AUTOSCAN=1 또는 RBYE_FRONTEND_PORT 변경 후 다시 실행하세요."
    exit 1
  elif [ "$AUTO_KILL" = "1" ]; then
    kill_port_holders "$FRONTEND_PORT"
  fi

  if is_port_in_use "$API_PORT"; then
    echo "오류: API 포트를 해제할 수 없습니다: $API_PORT"
    exit 1
  fi
  if is_port_in_use "$FRONTEND_PORT"; then
    echo "오류: 프론트 포트를 해제할 수 없습니다: $FRONTEND_PORT"
    exit 1
  fi
fi

if [ -z "${API_PORT:-}" ] || [ -z "${FRONTEND_PORT:-}" ]; then
  echo "포트 자동 탐색 실패: 유효한 포트를 찾지 못했습니다."
  echo "RBYE_PORT_SCAN_RANGE 또는 기본 포트를 조정하세요."
  exit 1
fi

if [ "$API_PORT" -eq "$FRONTEND_PORT" ]; then
  echo "경고: API/프론트 포트가 동일합니다. 프론트 포트를 +1로 조정합니다."
  FRONTEND_PORT=$((FRONTEND_PORT + 1))
fi
API_BASE_URL="http://localhost:${API_PORT}"

FRONTEND_BIN=(bash "$ROOT_DIR/scripts/run-next.sh")

cleanup() {
  if [ -n "${API_PID:-}" ] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" || true
  fi
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" || true
  fi
}

trap cleanup EXIT INT TERM

(
  cd "$API_DIR" || exit 1
  export PWD="$API_DIR"
  if [ "$API_WATCH" = "1" ] && node --help 2>/dev/null | grep -q -- "--watch"; then
    PORT="$API_PORT" node --watch index.js
  else
    PORT="$API_PORT" node index.js
  fi
) &
API_PID=$!

(
  cd "$ROOT_DIR" || exit 1
  export PWD="$ROOT_DIR"
  CHOKIDAR_USEPOLLING=1 \
  CHOKIDAR_INTERVAL=1000 \
  WATCHPACK_POLLING=true \
  WATCHPACK_POLLING_INTERVAL=1000 \
  RBYE_API_URL="$API_BASE_URL" \
  NEXT_PUBLIC_API_URL="$API_BASE_URL" \
  "${FRONTEND_BIN[@]}" dev -p "$FRONTEND_PORT" -H "$FRONTEND_HOST"
) &
FRONTEND_PID=$!

echo "RBYE API 시작 (PID=$API_PID): http://localhost:$API_PORT"
echo "RBYE Front 시작 (PID=$FRONTEND_PID): http://localhost:$FRONTEND_PORT"

while true; do
  if ! kill -0 "$API_PID" 2>/dev/null; then
    wait "$API_PID" || true
    cleanup
    break
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID" || true
    cleanup
    break
  fi

  sleep 1
done
