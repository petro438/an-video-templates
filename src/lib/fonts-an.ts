// ═══════════════════════════════════════════════════════════════
// AN Brand Font Loading — for AN-variant video templates.
// Mona Sans isn't in @remotion/google-fonts, so we use Inter as a
// visual stand-in (same geometric-sans lineage, ships with Remotion).
// ═══════════════════════════════════════════════════════════════

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: interFont } = loadInter();
const { fontFamily: monoFont } = loadIBMPlexMono();

export const f = {
  display: interFont,
  stats: interFont,
  body: interFont,
  mono: monoFont,
} as const;
