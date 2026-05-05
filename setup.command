#!/bin/bash
# AN Video Tools — one-time setup
# Double-click this file from Finder, or run ./setup.command from Terminal.

set -e
cd "$(dirname "$0")"

echo ""
echo "🔧 AN Video Tools — Setup"
echo "========================="
echo ""

if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ This setup is for macOS only. For other platforms, see SETUP.md"
  read -p "Press Enter to close..."
  exit 1
fi

# ── Homebrew ──────────────────────────────────────────────────────────────────
if ! command -v brew >/dev/null 2>&1; then
  echo "📦 Installing Homebrew (macOS package manager)..."
  echo "   You may be asked for your Mac password."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # On Apple Silicon, brew installs to /opt/homebrew — make sure it's on PATH for this session
  if [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
else
  echo "✓ Homebrew installed"
fi

# ── Node ──────────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "📦 Installing Node.js..."
  brew install node
else
  echo "✓ Node $(node --version) installed"
fi

# ── yt-dlp ────────────────────────────────────────────────────────────────────
if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "📦 Installing yt-dlp (YouTube downloader)..."
  brew install yt-dlp
else
  echo "✓ yt-dlp installed"
fi

# ── ffmpeg ────────────────────────────────────────────────────────────────────
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "📦 Installing ffmpeg (video encoder)..."
  brew install ffmpeg
else
  echo "✓ ffmpeg installed"
fi

# ── npm dependencies ──────────────────────────────────────────────────────────
echo ""
echo "📦 Installing project dependencies (this takes 1–2 min)..."
npm install

# ── .env setup ────────────────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  echo ""
  echo "🔑 Creating .env from template..."
  cp .env.example .env
  echo ""
  echo "⚠  Add your API keys to .env (it just opened in your editor):"
  echo "     • ANTHROPIC_API_KEY  — required for blueprint generation"
  echo "     • PEXELS_API_KEY     — optional, for b-roll search"
  echo "     • YOUTUBE_API_KEY    — optional, for YouTube b-roll"
  echo ""
  open -e .env
else
  echo "✓ .env already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "   To launch the app, double-click: start.command"
echo ""
read -p "Press Enter to close..."
