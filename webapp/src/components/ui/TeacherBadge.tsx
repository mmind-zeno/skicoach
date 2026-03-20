import { teacherColorAt } from "@/lib/colors";

export function TeacherBadge({
  colorIndex,
  name,
}: {
  colorIndex: number;
  name: string;
}) {
  const dot = teacherColorAt(colorIndex);
  return (
    <span className="inline-flex items-center gap-2 text-sm text-sk-ink">
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: dot }}
        aria-hidden
      />
      <span className="font-medium">{name}</span>
    </span>
  );
}
