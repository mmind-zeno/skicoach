"use client";

import { TeacherBadge } from "@/components/ui/TeacherBadge";
import { brand } from "@/config/brand";

export interface TeacherLegendItem {
  id: string;
  name: string | null;
  email: string;
  colorIndex: number;
}

export function TeacherLegend({ teachers }: { teachers: TeacherLegendItem[] }) {
  if (teachers.length === 0) {
    return (
      <p className="text-sm text-sk-ink/60">
        Keine aktiven {brand.labels.staffPlural} geladen.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-sk-ink">
      {teachers.map((t) => (
        <TeacherBadge
          key={t.id}
          colorIndex={t.colorIndex}
          name={t.name ?? t.email}
        />
      ))}
    </div>
  );
}
