import type { ReactNode } from "react";

/**
 * Vektor-/CSS-Vorschauen der umgesetzten Oberfläche — skaliert ohne Unschärfe.
 */

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sk-outline/25 bg-white shadow-sk-ambient ring-1 ring-sk-outline/10">
      {children}
    </div>
  );
}

/** Kalender: Mini-Monatsraster + Terminzeilen */
export function ProductPreviewCalendar() {
  const days = ["M", "D", "M", "D", "F", "S", "S"];
  const cells = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <PreviewFrame>
      <div className="flex items-center justify-between border-b border-sk-outline/15 bg-sk-container-high/40 px-3 py-2">
        <span className="text-[11px] font-semibold text-sk-ink">Februar 2026</span>
        <span className="text-[10px] font-medium text-sk-brand">Heute</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 p-2">
        {days.map((d, i) => (
          <div
            key={`h-${i}`}
            className="py-0.5 text-center text-[9px] font-medium text-sk-ink/45"
          >
            {d}
          </div>
        ))}
        {cells.map((n) => (
          <div
            key={n}
            className={
              n === 14
                ? "flex aspect-square items-center justify-center rounded-md bg-sk-highlight text-[10px] font-semibold text-sk-cta"
                : "flex aspect-square items-center justify-center rounded-md text-[10px] text-sk-ink/55"
            }
          >
            {n}
          </div>
        ))}
      </div>
      <div className="space-y-1.5 border-t border-sk-outline/15 p-2.5">
        <div className="h-2 rounded bg-sk-cta/20" />
        <div className="h-2 w-[88%] rounded bg-sk-brand/15" />
        <div className="h-2 w-[72%] rounded bg-sk-brand/10" />
      </div>
    </PreviewFrame>
  );
}

/** Öffentlicher Buchungswizard: Schritte + Kurskarten */
export function ProductPreviewBooking() {
  return (
    <PreviewFrame>
      <div className="flex justify-center gap-1.5 border-b border-sk-outline/15 bg-sk-container-high/30 px-3 py-2.5">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={
              s <= 2
                ? "h-1.5 w-10 rounded-full bg-sk-cta"
                : "h-1.5 w-10 rounded-full bg-sk-ink/12"
            }
          />
        ))}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-[11px] font-semibold text-sk-ink">Kurstyp wählen</p>
        <div className="space-y-1.5">
          <div className="rounded-xl border-2 border-sk-cta bg-sk-highlight px-2.5 py-2">
            <div className="text-[11px] font-medium text-sk-cta">Gruppenkurs</div>
            <div className="mt-0.5 text-[9px] text-sk-ink/60">120 Min · max. 8</div>
          </div>
          <div className="rounded-xl border border-transparent bg-sk-container-high/50 px-2.5 py-2 shadow-sm">
            <div className="text-[11px] font-medium text-sk-ink">Privatstunde</div>
            <div className="mt-0.5 text-[9px] text-sk-ink/60">60 Min</div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

/** Admin: Anfragetabelle */
export function ProductPreviewAdminRequests() {
  const rows = [
    { name: "M. Huber", date: "18.02.", st: "neu" },
    { name: "A. Meier", date: "19.02.", st: "neu" },
    { name: "K. Wolf", date: "20.02.", st: "ok" },
  ];
  return (
    <PreviewFrame>
      <div className="border-b border-sk-outline/15 bg-sk-container-high/40 px-2.5 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-sk-ink/70">
          Anfragen
        </span>
      </div>
      <div className="divide-y divide-sk-outline/10">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between gap-2 px-2.5 py-2"
          >
            <div className="min-w-0">
              <div className="truncate text-[11px] font-medium text-sk-ink">{r.name}</div>
              <div className="text-[9px] text-sk-ink/50">{r.date}</div>
            </div>
            <span
              className={
                r.st === "ok"
                  ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-800"
                  : "shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-medium text-violet-800"
              }
            >
              {r.st === "ok" ? "OK" : "Neu"}
            </span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

/** Gästeliste */
export function ProductPreviewGuestList() {
  const items = ["Nina Keller", "Jon Fuchs", "Sara Ali", "Tom Steiner"];
  return (
    <PreviewFrame>
      <div className="border-b border-sk-outline/15 bg-sk-container-high/40 px-2.5 py-2">
        <span className="text-[10px] font-semibold text-sk-ink/70">Gäste</span>
      </div>
      <ul className="divide-y divide-sk-outline/10">
        {items.map((name, i) => (
          <li key={name} className="flex items-center gap-2 px-2.5 py-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  i === 0 ? "#3b82f6" : i === 1 ? "#22c55e" : i === 2 ? "#8b5cf6" : "#f59e0b",
              }}
            />
            <span className="truncate text-[11px] text-sk-ink">{name}</span>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}

/** Gastprofil (Detail) */
export function ProductPreviewGuestDetail() {
  return (
    <PreviewFrame>
      <div className="border-b border-sk-outline/15 bg-sk-container-high/40 px-3 py-2.5">
        <div className="text-[12px] font-semibold text-sk-ink">Elena Brandt</div>
        <div className="text-[10px] text-sk-ink/55">elena@example.org</div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex gap-2 text-[10px]">
          <span className="rounded-md bg-sk-container-high px-2 py-1 text-sk-ink/70">Niveau</span>
          <span className="rounded-md bg-sk-highlight px-2 py-1 font-medium text-sk-cta">
            Fortgeschritten
          </span>
        </div>
        <div className="space-y-1 rounded-lg bg-sk-container-high/40 p-2">
          <div className="h-1.5 w-full rounded bg-sk-ink/10" />
          <div className="h-1.5 w-[90%] rounded bg-sk-ink/8" />
        </div>
        <div className="text-[9px] font-medium uppercase tracking-wide text-sk-ink/45">
          Kontakt
        </div>
        <div className="rounded-lg border border-sk-outline/15 bg-white px-2 py-1.5 text-[10px] text-sk-ink/65">
          Telefon · Notiz …
        </div>
      </div>
    </PreviewFrame>
  );
}
