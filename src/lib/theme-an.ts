// ═══════════════════════════════════════════════════════════════
// Action Network Brand Theme (Dark) — for AN-variant video templates
// Mirrors the structure of theme.ts so templates can drop-in swap.
// Values come from the AN design system (tokens.css, dark mode).
// ═══════════════════════════════════════════════════════════════
import React from "react";

// Dark-mode AN tokens. Keys mirror theme.ts so existing templates can
// switch palettes by changing only the import path.
export const colors = {
  bg: "#17171c",            // surface-background
  surface: "#22222b",       // surface-foreground
  surface2: "#2c2c36",      // surface-elevated-foreground
  surface3: "#32323b",      // surface-ui-element
  card: "#22222b",          // surface-foreground

  // Primary brand accent — AN green
  yellow: "#00c358",        // buttons-primary-green (kept key name for compat)
  yellowLight: "#0ce970",   // text-icons-green (dark mode)
  yellowDark: "#009c46",    // buttons-primary-green-hover (light variant)
  yellowMuted: "rgba(0, 195, 88, 0.12)", // labels-green-background

  green: "#00c358",
  greenLight: "#0ce970",
  greenDark: "#009c46",
  greenMuted: "rgba(0, 195, 88, 0.12)",

  // Negative / loss
  red: "#ff4d5a",           // text-icons-red (dark)
  redMuted: "rgba(243, 37, 53, 0.14)",
  orange: "#fa7c47",        // labels-orange-text (dark) — line movement / Labs
  gold: "#f5e23d",          // labels-yellow-text (dark)
  blue: "#8ac5ff",          // text-icons-interactive (dark)
  cyan: "#36c2b3",          // markets-props
  white: "#f7f8fd",         // text-icons-primary (dark)
  text1: "#f7f8fd",         // text-icons-primary
  text2: "#b7b8bd",         // text-icons-secondary
  text3: "#8c8c94",         // text-icons-tertiary
  text4: "#42424b",         // dividers-border (used as "barely visible" text)

  border: "#42424b",        // dividers-border
  borderLight: "#42424b",
  borderBright: "#00c358",
} as const;

// Inter as a Mona Sans stand-in (Mona Sans isn't in @remotion/google-fonts).
// Loaded in fonts-an.ts.
export const fonts = {
  display: "'Inter','Mona Sans',-apple-system,sans-serif",
  stats: "'Inter','Mona Sans',-apple-system,sans-serif",
  body: "'Inter','Mona Sans',-apple-system,sans-serif",
  mono: "'IBM Plex Mono','SF Mono',monospace",
} as const;

export const layout = { width: 1920, height: 1080, safeMargin: 80 } as const;

export const anim = {
  springSnappy: { damping: 280, stiffness: 400, mass: 0.65 },
  springBouncy: { damping: 12, stiffness: 200, mass: 0.9 },
  springSmooth: { damping: 38, stiffness: 150, mass: 0.9 },
  fadeIn: 8, stagger: 2, countUp: 20,
} as const;

export const styles = {
  darkBg: { backgroundColor: colors.bg } as React.CSSProperties,
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,        // AN default card radius
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  watermark: {
    position: "absolute" as const, bottom: 32, right: 48,
    fontSize: 14, fontFamily: fonts.mono, fontWeight: 500,
    color: colors.text3, letterSpacing: "0.18em", textTransform: "uppercase" as const,
  } as React.CSSProperties,
} as const;

// AN templates don't use scanlines — render this as a no-op so files can stay
// structurally identical to the broadcast versions.
export const Scanlines: React.FC = () => null;

// Re-export the shared types so AN templates can import them from here too.
export type {
  FieldType, SchemaField, TemplateSchema,
  OddsCardProps, StatComparisonProps, BigNumberProps, TimelineProps,
  QuoteCardProps, StandingsTableProps, ScoreboardProps, ProbabilityVizProps,
  PhotoStatProps, ExplainerProps, ComparableProps, LowerThirdProps,
  HeatMapProps, ScatterPlotProps, FlexTableProps, SeasonScheduleProps,
  GameFlashProps, ListScannerProps, DotStripProps, RetroTVProps,
  BackgroundProps, OldNewspaperProps,
} from "./theme";
