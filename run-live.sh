#!/usr/bin/env bash
# Live LLM mode — pass key via env, never commit keys to git
set -euo pipefail
cd "$(dirname "$0")"

if [[ -z "${GROQ_API_KEY:-}" ]]; then
  echo "Usage: GROQ_API_KEY=your-key ./run-live.sh"
  exit 1
fi

export MEDGRAPH_DEMO=0
export MEDGRAPH_JAC_PORT="${MEDGRAPH_JAC_PORT:-8000}"

pkill -f "jac start main.jac" 2>/dev/null || true
pkill -f "serve.py" 2>/dev/null || true
sleep 1

rm -rf .jac/data .jac/cache
mkdir -p .jac/data

if command -v lsof >/dev/null 2>&1; then
  lsof -ti:"$MEDGRAPH_JAC_PORT" | xargs kill -9 2>/dev/null || true
  lsof -ti:5500 | xargs kill -9 2>/dev/null || true
fi

echo "Starting Jac API (live LLM) on :${MEDGRAPH_JAC_PORT}..."
MEDGRAPH_DEMO=0 GROQ_API_KEY="$GROQ_API_KEY" jac start main.jac --port "$MEDGRAPH_JAC_PORT" --no_client &
sleep 7

echo "Starting UI proxy on :5500..."
cd frontend
MEDGRAPH_JAC_PORT="$MEDGRAPH_JAC_PORT" python3 serve.py &
sleep 2

echo ""
echo "  UI:  http://127.0.0.1:5500"
echo "  API: http://127.0.0.1:${MEDGRAPH_JAC_PORT}/docs"
echo ""

if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:5500"
fi

wait
