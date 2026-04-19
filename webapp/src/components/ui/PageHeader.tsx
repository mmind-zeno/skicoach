import type { ReactNode } from "react";

/** Stitch: klare Editorial-Hierarchie, keine harte Trennlinie unter dem Titel */
export function PageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  /** Optionaler Untertitel / Einleitung unter der Überschrift */
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-sk-ink md:text-3xl md:leading-tight">
          {title}
        </h1>
        {lead ? (
          <p className="mt-2 max-w-2xl text-sm text-sk-ink/70">{lead}</p>
        ) : null}
        <div
          className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-sk-cta to-sk-cta-mid"
          aria-hidden
        />
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
