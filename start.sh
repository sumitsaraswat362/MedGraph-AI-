#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

export MEDGRAPH_DEMO="${MEDGRAPH_DEMO:-1}"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  MedGraph AI — starting Jac API + frontend               ║"
echo "╚══════════════════════════════════════════════════════════╝"

if ! command -v jac >/dev/null 2>&1; then
  echo "Install: pip install jaclang byllm"
  exit 1
fi

# Clear stale SQLite graph (corrupt anchors break /walker/*)
rm -rf .jac/data .jac/cache 2>/dev/null || true
mkdir -p .jac/data

JAC_PORT="${MEDGRAPH_JAC_PORT:-8000}"
# Free port so jac does not silently move to 8001 (breaks serve.py proxy)
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:"$JAC_PORT" | xargs kill -9 2>/dev/null || true
  lsof -ti:5500 | xargs kill -9 2>/dev/null || true
fi

echo "[1/2] Jac API on http://127.0.0.1:${JAC_PORT} (demo_mode=$MEDGRAPH_DEMO)"
MEDGRAPH_DEMO="$MEDGRAPH_DEMO" jac start main.jac --port "$JAC_PORT" --no_client &
JAC_PID=$!

sleep 8

echo "[2/2] Frontend + API proxy on http://127.0.0.1:5500"
cd frontend
MEDGRAPH_JAC_PORT="$JAC_PORT" python3 serve.py &
WEB_PID=$!

cleanup() { kill "$JAC_PID" "$WEB_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo ""
echo "  Open: http://127.0.0.1:5500"
echo "  API docs: http://127.0.0.1:${JAC_PORT}/docs"
echo "  Live LLM: MEDGRAPH_DEMO=0 GROQ_API_KEY=... ./run-live.sh"
echo "  Press Ctrl+C to stop both servers."
echo ""

if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:5500" 2>/dev/null || true
fi

# wait returns non-zero if a child exits — do not treat as script failure
wait || true
