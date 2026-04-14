/**
 * Design tokens from Google Stitch project `5397023336978297379` („Skicoach Management Portal“ /
 * „Alpenglow Management“): navy secondary + Alpenglow orange primary.
 * Gleiche Werte in `tailwind.config.ts` (theme.extend.colors.sk).
 */
export const sk = {
  /** on_surface */
  ink: "#181c20",
  /** Glacial navy — sidebar, text links, outline buttons */
  brand: "#305f9b",
  brandHover: "#264d85",
  /** Alpenglow — primary CTAs, booking critical path */
  cta: "#ab3500",
  ctaHover: "#8c2e00",
  ctaMid: "#ff6b35",
  /** surface */
  surface: "#f7f9fe",
  /** M3 surface_container* — geschichtete Flächen (ohne harte Linien) */
  container: "#ebeef3",
  containerLow: "#f1f4f9",
  containerHigh: "#e5e8ed",
  containerHighest: "#dfe3e8",
  /** secondary_fixed / on_secondary_fixed — „Professional Badges“ */
  badgeBg: "#d4e3ff",
  badgeFg: "#001c3a",
  /** secondary_fixed — selected cards / list rows */
  highlight: "#d4e3ff",
  /** outline_variant — dezente Grenzen (Ghost-Border) */
  outlineMuted: "#e1bfb5",
} as const;

export type SkColorKey = keyof typeof sk;

/** Kalender-Legende / Punkte (unabhängig vom Stitch-M3-Set) */
export const TEACHER_COLORS = [
  "#305f9b",
  "#ab3500",
  "#0d9488",
  "#7c3aed",
  "#ca8a04",
  "#db2777",
] as const;

/** Event-Hintergrund + Text für react-big-calendar */
export const TEACHER_CALENDAR_EVENT = [
  { bg: "#d4e3ff", fg: "#0e4782" },
  { bg: "#ffdbd0", fg: "#5f1900" },
  { bg: "#ccfbf1", fg: "#115e59" },
  { bg: "#ede9fe", fg: "#5b21b6" },
  { bg: "#fef3c7", fg: "#92400e" },
  { bg: "#ffe4e6", fg: "#9f1239" },
] as const;

export type StatusBadgeVariant =
  | "geplant"
  | "durchgefuehrt"
  | "storniert"
  | "offen"
  | "bezahlt"
  | "storniert_rechnung"
  | "anfrage_neu"
  | "anfrage_bestaetigt"
  | "anfrage_abgelehnt";

/** Hintergrund + Text für StatusBadge */
export const STATUS_BADGE_STYLE: Record<
  StatusBadgeVariant,
  { backgroundColor: string; color: string }
> = {
  geplant: { backgroundColor: "#d4e3ff", color: "#0e4782" },
  durchgefuehrt: { backgroundColor: "#DCFCE7", color: "#166534" },
  storniert: { backgroundColor: "#F1F5F9", color: "#64748b" },
  offen: { backgroundColor: "#FEF3C7", color: "#92400e" },
  bezahlt: { backgroundColor: "#DCFCE7", color: "#166534" },
  storniert_rechnung: { backgroundColor: "#F1F5F9", color: "#64748b" },
  anfrage_neu: { backgroundColor: "#EDE9FE", color: "#5b21b6" },
  anfrage_bestaetigt: { backgroundColor: "#DCFCE7", color: "#166534" },
  anfrage_abgelehnt: { backgroundColor: "#F1F5F9", color: "#64748b" },
};

export function teacherColorAt(index: number): string {
  const i = Math.min(Math.max(index, 0), TEACHER_COLORS.length - 1);
  return TEACHER_COLORS[i];
}

export function teacherCalendarStyle(index: number): {
  backgroundColor: string;
  color: string;
} {
  const i = Math.min(Math.max(index, 0), TEACHER_CALENDAR_EVENT.length - 1);
  const x = TEACHER_CALENDAR_EVENT[i];
  return { backgroundColor: x.bg, color: x.fg };
}
