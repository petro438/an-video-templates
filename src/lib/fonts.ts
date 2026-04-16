// ═══════════════════════════════════════════════════════════════
// Font Loading — @remotion/google-fonts integration
// Import this in every template to ensure fonts are loaded
// ═══════════════════════════════════════════════════════════════

// League Gothic: Display / headlines — broadcast chyron energy
import { loadFont as loadLeagueGothic } from "@remotion/google-fonts/LeagueGothic";

// Bebas Neue: Numbers, scores, stats — scoreboard readability
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";

// Barlow Condensed: Body text — compact, broadcast-appropriate, legible
import { loadFont as loadBarlowCondensed } from "@remotion/google-fonts/BarlowCondensed";

// IBM Plex Mono: Data, timestamps, source attributions
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: displayFont } = loadLeagueGothic();
const { fontFamily: statsFont } = loadBebasNeue();
const { fontFamily: bodyFont } = loadBarlowCondensed();
const { fontFamily: monoFont } = loadIBMPlexMono();

export const f = {
  display: displayFont,
  stats: statsFont,
  body: bodyFont,
  mono: monoFont,
} as const;
