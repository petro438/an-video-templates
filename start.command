#!/bin/bash
# AN Video Tools — launcher
# Starts the Builder UI + render server and opens the browser.
# Double-click this file from Finder, or run ./start.command from Terminal.

cd "$(dirname "$0")"

echo ""
echo "🚀 AN Video Tools"
echo "================="
echo ""

# Make sure brew binaries on Apple Silicon are on PATH (in case launched from Finder)
if [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi

# Sanity check
if [[ ! -d node_modules ]]; then
  echo "❌ Dependencies not installed. Double-click setup.command first."
  read -p "Press Enter to close..."
  exit 1
fi

# Free up ports if something's lingering from a previous run
lsof -ti :3001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti :3100 2>/dev/null | xargs kill -9 2>/dev/null || true

LOG_DIR="$(pwd)/.logs"
mkdir -p "$LOG_DIR"

echo "▸ Starting render server (port 3100)..."
npm run render-server >"$LOG_DIR/render-server.log" 2>&1 &
RENDER_PID=$!

echo "▸ Starting Builder UI (port 3001)..."
npm run builder >"$LOG_DIR/builder.log" 2>&1 &
BUILDER_PID=$!

# Wait for the builder to come up before opening the browser
echo "▸ Waiting for servers..."
for i in {1..20}; do
  if curl -s -o /dev/null http://localhost:3001; then break; fi
  sleep 0.5
done

echo "▸ Opening http://localhost:3001"
open http://localhost:3001

echo ""
echo "✅ Running."
echo "   Logs:    $LOG_DIR/"
echo "   Stop:    Press Ctrl+C in this window, or just close it."
echo ""

# Clean up child processes on exit
trap 'echo ""; echo "🛑 Stopping..."; kill $BUILDER_PID $RENDER_PID 2>/dev/null; exit 0' INT TERM

# Stay alive while children run
wait
