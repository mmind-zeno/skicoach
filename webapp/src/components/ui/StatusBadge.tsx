import {
  STATUS_BADGE_STYLE,
  type StatusBadgeVariant,
} from "@/lib/colors";

const LABELS: Record<StatusBadgeVariant, string> = {
  geplant: "Geplant",
  durchgefuehrt: "Durchgeführt",
  storniert: "Storniert",
  offen: "Offen",
  bezahlt: "Bezahlt",
  storniert_rechnung: "Storniert",
  anfrage_neu: "Neu",
  anfrage_bestaetigt: "Bestätigt",
  anfrage_abgelehnt: "Abgelehnt",
};

export function StatusBadge({
  variant,
  label,
}: {
  variant: StatusBadgeVariant;
  label?: string;
}) {
  const s = STATUS_BADGE_STYLE[variant];
  return (
    <span
      className="inline-block rounded-[20px] px-[9px] py-[3px] text-[11px] font-medium leading-none"
      style={{ backgroundColor: s.backgroundColor, color: s.color }}
    >
      {label ?? LABELS[variant]}
    </span>
  );
}
