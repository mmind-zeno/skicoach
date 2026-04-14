import { teacherColorAt } from "@/lib/colors";

/** Stitch „Professional Badge“: Pill + Lehrer-Farbpunkt */
export function TeacherBadge({
  colorIndex,
  name,
}: {
  colorIndex: number;
  name: string;
}) {
  const dot = teacherColorAt(colorIndex);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sk-outline/25 bg-sk-badge-bg/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-sk-badge-fg shadow-sm">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/80"
        style={{ backgroundColor: dot }}
        aria-hidden
      />
      <span className="font-semibold normal-case tracking-normal">{name}</span>
    </span>
  );
}
