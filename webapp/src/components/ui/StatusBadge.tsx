import {
  STATUS_BADGE_STYLE,
  type StatusBadgeVariant,
} from "@/lib/colors";
import { brand } from "@/config/brand";

const LABELS: Record<StatusBadgeVariant, string> = {
  geplant: brand.labels.statusGeplant,
  durchgefuehrt: brand.labels.statusDurchgefuehrt,
  storniert: brand.labels.statusStorniert,
  offen: brand.labels.statusOffen,
  bezahlt: brand.labels.statusBezahlt,
  storniert_rechnung: brand.labels.statusStorniert,
  anfrage_neu: brand.labels.statusAnfrageNeu,
  anfrage_bestaetigt: brand.labels.statusAnfrageBestaetigt,
  anfrage_abgelehnt: brand.labels.statusAnfrageAbgelehnt,
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
