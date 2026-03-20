"use client";

import type { GuestListItem } from "../types";

export function GuestList({
  guests,
  selectedId,
  onSelect,
  onNew,
}: {
  guests: GuestListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-lg border border-sk-ink/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-sk-ink/10 p-3">
        <span className="text-sm font-medium text-sk-ink">Gästeliste</span>
        <button
          type="button"
          onClick={onNew}
          className="rounded bg-sk-brand px-3 py-2 text-sm font-medium text-white hover:bg-sk-hover"
        >
          + Neu
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-sk-surface text-xs text-sk-ink/60">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2 hidden sm:table-cell">E-Mail</th>
              <th className="px-3 py-2">Tel.</th>
              <th className="px-3 py-2 hidden lg:table-cell">Firma</th>
              <th className="px-3 py-2">Niveau</th>
              <th className="px-3 py-2 w-12 text-center">#</th>
              <th className="px-3 py-2 hidden md:table-cell">Letzte Buchung</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr
                key={g.id}
                className={`cursor-pointer border-t border-sk-ink/5 hover:bg-sk-surface ${
                  selectedId === g.id ? "bg-[#E8F0FA]" : ""
                }`}
                onClick={() => onSelect(g.id)}
              >
                <td className="px-3 py-2 font-medium text-sk-ink">{g.name}</td>
                <td className="px-3 py-2 text-sk-ink/70 hidden sm:table-cell">
                  {g.email ?? "—"}
                </td>
                <td className="px-3 py-2 text-sk-ink/70">{g.phone ?? "—"}</td>
                <td className="px-3 py-2 text-sk-ink/60 hidden lg:table-cell">
                  {g.company ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs capitalize">{g.niveau}</td>
                <td className="px-3 py-2 text-center text-xs text-sk-ink/70">
                  {g.bookingCount}
                </td>
                <td className="px-3 py-2 text-xs text-sk-ink/60 hidden md:table-cell">
                  {g.lastBookingDate ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guests.length === 0 ? (
          <p className="p-4 text-center text-sm text-sk-ink/50">
            Keine Gäste — Suche anpassen oder neu anlegen.
          </p>
        ) : null}
      </div>
    </div>
  );
}
