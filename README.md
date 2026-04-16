# Action Network Video Template Library v2

Remotion-based motion graphics pipeline with 12 templates, a companion builder app, and batch rendering support.

## Quick Start

```bash
npm install

# Remotion Studio — preview all templates with animation
npm run dev          # → localhost:3000

# Template Builder — design graphics, paste data, export JSON
npm run builder      # → localhost:3001
```

Run both simultaneously in separate terminals for the full workflow.

## Templates

| ID | Template | Description |
|----|----------|-------------|
| T1 | Odds Card | Moneyline, spread, over/under |
| T2 | Stat Comparison | Side-by-side bars |
| T3 | Big Number | Dramatic single stat |
| T4 | Timeline | Line chart over time |
| T5 | Quote Card | Word-by-word reveal |
| T6 | Standings Table | Rankings with highlights |
| T7 | Scoreboard | Final score + badge |
| T8 | Probability Viz | Donut / icon grid |
| T9 | Photo + Stat | Stat overlay for photos |
| T10 | Explainer Box | Numbered methodology steps |
| T11 | Comparable Card | "This is like that" analogy |
| T12 | Lower Third | Source / speaker overlay |

## Workflow

1. Open the **Builder** at localhost:3001
2. Pick a template, fill in data (paste from spreadsheet for tables/stats)
3. Preview the graphic in real-time
4. Copy the **render command** or **JSON props**
5. Paste in terminal to render MP4

## Rendering

```bash
# Single template with custom props
npx remotion render src/index.ts OddsCard out/my-odds.mp4 --props='{"teamA":{"name":"KC","odds":"-180"},...}'

# Batch render all sample compositions
npm run render:all

# Render from a blueprint JSON file
npm run render:blueprint path/to/blueprint.json
```

## Adding / Editing Templates

1. **Schema** → `src/lib/schemas.js` (field definitions, types, defaults)
2. **Component** → `src/templates/TemplateName.tsx` (Remotion component)
3. **Sample data** → `src/data/miracle-on-ice.ts`
4. **Registration** → `src/Root.tsx` (add Composition)

The builder reads from `schemas.js` automatically — no separate form updates needed.

## Typography

- **Barlow Condensed** — headlines, team names
- **Bebas Neue** — numbers, odds, scores
- **Barlow** — body text, descriptions
- **IBM Plex Mono** — timestamps, attributions

## Project Structure

```
an-video-templates/
├── builder/           # Companion builder app (Vite + React)
│   ├── App.jsx
│   ├── index.html
│   ├── main.jsx
│   └── vite.config.js
├── scripts/           # Batch rendering scripts
├── src/
│   ├── data/          # Sample data (Miracle on Ice)
│   ├── lib/
│   │   ├── fonts.ts   # Google Fonts loader for Remotion
│   │   ├── schemas.js # Shared schema definitions (source of truth)
│   │   └── theme.ts   # Colors, layout, animation presets
│   ├── templates/     # 12 Remotion template components
│   ├── Root.tsx
│   └── index.ts
└── package.json
```
