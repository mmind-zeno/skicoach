import type { ReactNode } from "react";

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-4 flex h-[52px] items-center justify-between border-b border-black/[0.08] bg-white px-1">
      <h1 className="text-base font-medium text-sk-ink">{title}</h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
