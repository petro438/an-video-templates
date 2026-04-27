# Action Network Video Templates — Setup Guide

A Remotion-based motion graphics pipeline that turns articles and stats into broadcast-quality animated video graphics.

---

## Quick Start (5 minutes)

### 1. Install prerequisites

You need **Node.js 18+** installed. Check with:

```bash
node --version
```

If you don't have it, download from [nodejs.org](https://nodejs.org/) (LTS version).

### 2. Clone the repo and install

```bash
git clone https://github.com/petro438/an-video-templates.git
cd an-video-templates
npm install
```

This takes 1-2 minutes. Remotion automatically downloads its own Chromium for rendering — no separate browser install needed.

### 3. Set up your API key

Copy the example env file and add your Anthropic API key. This is only needed if you want to use the AI blueprint generator (article-to-video). You can skip this step if you only want to use the Builder UI.

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```


### 4. Launch the Builder

```bash
npm run builder
```

Open **http://localhost:3001** in your browser. You should see the template list on the left.

---

## Three Ways to Work

### Option A: Template Builder (recommended for beginners)

The Builder is a visual form-based tool for designing individual graphics.

**Start the Builder:**
```bash
npm run builder
```

**Start the Render Server** (Control+T to open a second window in the same terminal):
```bash
npm run render-server
```

**How to use it:**
1. Pick a template from the left sidebar (e.g., Scoreboard, Odds Card)
2. Fill in the fields — team names, scores, stats
3. Use the **Team Picker** (lightning bolt button next to name fields) to auto-fill team colors, logos, and abbreviations
4. Toggle **Show Logos** to display team logos instead of text abbreviations
5. Click the **Preview** tab to see the animated graphic
6. Click the **Render** tab → **Render** button to export an MP4
7. Output files are saved to the `out/` folder in the project

**Builder ports:**
- Builder UI: **http://localhost:3001**
- Render Server: **http://localhost:3100** (must be running for the Render button to work)

### Option B: Remotion Studio (for previewing and fine-tuning)

Remotion Studio gives you a full animation timeline with frame-by-frame scrubbing.

```bash
npm run dev
```

Open **http://localhost:3000**. Select any composition from the sidebar to preview it. You can render directly from the Studio UI as well.

### Option C: AI Blueprint Generator (article to video)

Feed an article or stats into the AI, and it generates a full video blueprint — narrative beats with matched template graphics.

**From a text file:**
```bash
npm run generate -- --input path/to/article.txt
```

**From a PDF** (great for Action Network articles — print to PDF first):
```bash
npm run generate -- --input path/to/article.pdf
```

**From a URL:**
```bash
npm run generate:url -- https://example.com/article
```

This creates `out/blueprint.json` and `out/blueprint-production-sheet.csv`.

**Then render all the graphics:**
```bash
npm run render:blueprint out/blueprint.json
```

This renders one MP4 per graphic shot into the `out/` folder. The production sheet CSV maps each beat's narration to its corresponding MP4 file — use it as a guide when assembling in your video editor.

**Render a single beat** (useful for re-rendering just one):
```bash
npm run render:blueprint out/blueprint.json --beat 3
```

---

## Template Reference

| # | Template | Best For |
|---|----------|----------|
| T1 | Odds Card | Moneyline, spread, over/under |
| T2 | Stat Comparison | Side-by-side stat bars (Team A vs B) |
| T3 | Big Number | Single hero stat with count-up animation |
| T4 | Timeline | Line chart showing trends over time |
| T5 | Quote Card | Featured quote with attribution |
| T6 | Standings Table | Rankings with highlighted rows |
| T7 | Scoreboard | Final score display with badge |
| T8 | Probability Viz | Donut chart or icon grid |
| T9 | Photo Stat | Stats alongside a photo placeholder |
| T10 | Explainer | Step-by-step breakdown |
| T11 | Comparable | "This is like that" analogy card |
| T12 | Lower Third | Name/title bar overlay |
| T13 | Heat Map | Color-intensity grid |
| T14 | Scatter Plot | X/Y chart with labeled points |
| T15 | Flex Table | Variable columns and rows |
| T16 | Season Schedule | W/L season grid (green/red) |
| T17 | Game Flash | Games revealed one at a time |
| T18 | List Scanner | Scrolls through a list, pauses on highlight |
| T19 | Dot Strip | Single-stat dot distribution chart |
| T20 | Retro TV | CRT television frame overlay |

---

## Team Logos & Colors

The Builder includes a built-in team database with logos, colors, and abbreviations for NFL, NBA, MLB, NHL, WNBA, NCAAF, NCAAB, and international teams.

**Using the Team Picker:**
1. Click the **lightning bolt button** next to any team name field
2. Select a sport tab, then search or scroll to find the team
3. Click the team to auto-fill the name, color, and logo URL
4. For templates with two teams, each name field has its own picker

**Auto-detection:** Templates with "Show Logos" toggled on will automatically detect team names (abbreviation, nickname, or full name) and display the matching logo. No URL needed — just type "Chiefs" or "KC" or "Kansas City Chiefs" and it resolves automatically.

---

## Rendering from the Command Line

**Render a single template with custom props:**
```bash
npx remotion render src/index.ts OddsCard out/my-odds.mp4 --props='{"teamA":{"name":"KC","odds":"-180"},"teamB":{"name":"DET","odds":"+155"}}'
```

**Render all compositions with default data:**
```bash
npm run render:all
```

**Render with transparency** (for compositing over video):
```bash
npx remotion render src/index.ts RetroTV out/tv-frame.webm --codec=vp8
```

---

## Folder Structure

```
an-video-templates/
├── builder/           # Builder UI (Vite app)
├── out/               # Rendered MP4s and blueprints (gitignored)
├── scripts/
│   ├── generate-blueprint.mjs   # AI blueprint generator
│   ├── render-blueprint.mjs     # Blueprint batch renderer
│   └── render-server.mjs        # HTTP render server
├── src/
│   ├── data/          # Sample data (Miracle on Ice theme)
│   ├── lib/
│   │   ├── schemas.js    # Template field definitions (Builder reads this)
│   │   ├── theme.ts      # Design system (colors, fonts, animations)
│   │   ├── teams.json    # Team database (logos, colors)
│   │   └── teamLookup.ts # Auto-detect team logos from names
│   ├── templates/     # All 20 template components
│   ├── Root.tsx        # Remotion composition registry
│   └── index.ts        # Entry point
├── .env               # API keys (not committed)
├── .env.example       # Template for .env
└── package.json
```

---

## Common Issues

**Builder shows "Render server offline"**
Start the render server in a separate terminal: `npm run render-server`

**Port already in use**
Kill the old process:
```bash
# Find and kill process on a specific port
lsof -ti :3001 | xargs kill -9
lsof -ti :3100 | xargs kill -9
```

**Preview goes black in Builder**
Click the **Retry** button if shown, or refresh the page. Some templates with empty data will show a black screen — fill in the required fields first.

**Blueprint generation fails with auth error**
Make sure your `.env` file has a valid `ANTHROPIC_API_KEY` and you're running the command from the project root directory.

**Team logos not showing**
Toggle "Show Logos" on in the template. Make sure the team name matches something in the database (abbreviation, display name, or full name). Check `src/lib/teams.json` to see available teams.

---

## All Commands Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Launch Remotion Studio (localhost:3000) |
| `npm run builder` | Launch Builder UI (localhost:3001) |
| `npm run render-server` | Launch render server (localhost:3100) |
| `npm run generate -- --input <file>` | Generate blueprint from text/PDF |
| `npm run generate:url -- <url>` | Generate blueprint from URL |
| `npm run render:blueprint <file>` | Render all shots from a blueprint |
| `npm run render:all` | Render all compositions with defaults |
