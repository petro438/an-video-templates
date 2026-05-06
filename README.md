# Action Network Video Templates

A Remotion-based motion graphics pipeline that turns articles and stats into broadcast-quality animated video graphics.

The toolchain ships with 20+ reusable templates, an AI blueprint generator (article/URL → narrated shot list), a Pexels b-roll search built into the Builder UI, and batch helpers for YouTube clip downloads.

## Setup

See [SETUP.md](./SETUP.md) for the full guide. The fastest path on Mac:

1. Clone the repo
2. Double-click `setup.command` (installs Node, yt-dlp, ffmpeg, project deps; opens `.env` for API keys)
3. Double-click `start.command` to launch the Builder at <http://localhost:3001>

## What's inside

- **Builder UI** (`npm run builder`) — visual editor for all 20+ templates with live preview and one-click render
- **Tools tab** — Pexels b-roll search + Article→Blueprint generation, in-browser
- **CLI scripts** — blueprint generation, batch clip downloads, Pexels/YouTube b-roll search
- **Remotion Studio** (`npm run dev`) — frame-by-frame preview and timeline editing

Full command reference and architecture notes in [SETUP.md](./SETUP.md) and [CLAUDE.md](./CLAUDE.md).
