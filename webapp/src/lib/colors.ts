/**
 * Markenfarben — gleiche Werte in `tailwind.config.ts` (theme.extend.colors.sk).
 * Für PDFs, E-Mails, Charts: hier importieren statt Hex zu duplizieren.
 */
export const sk = {
  ink: "#1A1A2E",
  brand: "#1B4F8A",
  brandHover: "#163d6b",
  surface: "#F7F9FC",
} as const;

export type SkColorKey = keyof typeof sk;

/** Kalender-Legende / Punkte: kompakter Akzent (CLAUDE.md) */
export const TEACHER_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#14b8a6",
] as const;

/** Event-Hintergrund + Text für react-big-calendar (CLAUDE.md Lehrer-Farben) */
export const TEACHER_CALENDAR_EVENT = [
  { bg: "#DBEAFE", fg: "#1e40af" },
  { bg: "#DCF5E7", fg: "#166534" },
  { bg: "#EDE9FE", fg: "#5b21b6" },
  { bg: "#FEF3C7", fg: "#92400e" },
  { bg: "#FFE4E6", fg: "#9f1239" },
  { bg: "#CCFBF1", fg: "#115e59" },
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

/** Hintergrund + Text für StatusBadge (CLAUDE.md) */
export const STATUS_BADGE_STYLE: Record<
  StatusBadgeVariant,
  { backgroundColor: string; color: string }
> = {
  geplant: { backgroundColor: "#DBEAFE", color: "#1e40af" },
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
