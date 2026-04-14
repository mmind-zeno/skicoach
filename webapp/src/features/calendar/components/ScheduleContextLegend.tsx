"use client";

import { TeacherBadge } from "@/components/ui/TeacherBadge";
import { brand } from "@/config/brand";

export interface WeeklySummaryLine {
  teacherId: string;
  teacherName: string;
  colorIndex: number;
  lines: string[];
}

export function ScheduleContextLegend({
  weeklySummaries,
}: {
  weeklySummaries: WeeklySummaryLine[];
}) {
  if (weeklySummaries.length === 0) return null;

  return (
    <div className="mt-3 space-y-3 border-t border-sk-ink/10 pt-3 text-xs text-sk-ink/85">
      <p className="font-medium text-sk-ink">
        {brand.labels.calendarScheduleLegendTitle}
      </p>
      <ul className="space-y-2">
        {weeklySummaries.map((s) => (
          <li key={s.teacherId} className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-2">
              <TeacherBadge colorIndex={s.colorIndex} name={s.teacherName} />
              <span className="text-sk-ink/55">
                {brand.labels.calendarScheduleWeeklyHoursLabel}
              </span>
            </span>
            <span className="pl-1 text-sk-ink/75">{s.lines.join(" · ")}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sk-ink/65">
        <span>{brand.labels.calendarLegendAppointments}</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-rose-400 bg-rose-200"
            aria-hidden
          />
          {brand.labels.calendarLegendVacation}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm border-2 border-dotted border-slate-400 bg-slate-200"
            aria-hidden
          />
          {brand.labels.calendarLegendBlocked}
        </span>
      </div>
    </div>
  );
}
