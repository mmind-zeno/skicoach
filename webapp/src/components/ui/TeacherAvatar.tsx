import { teacherCalendarStyle } from "@/lib/colors";

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0] + p[p.length - 1]![0]).toUpperCase();
}

const sizePx = { sm: 28, md: 36, lg: 48 } as const;

export function TeacherAvatar({
  name,
  colorIndex,
  size = "md",
}: {
  name: string;
  colorIndex: number;
  size?: keyof typeof sizePx;
}) {
  const { backgroundColor, color } = teacherCalendarStyle(colorIndex);
  const px = sizePx[size];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{
        width: px,
        height: px,
        backgroundColor,
        color,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
