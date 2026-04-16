"use client";

import type { GuestListItem } from "../types";
import { brand } from "@/config/brand";

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
    <div className="sk-surface-card flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex items-center justify-between bg-sk-container-low px-4 py-3.5">
        <span className="text-sm font-semibold tracking-tight text-sk-ink">
          {brand.labels.clientPlural}
          {brand.labels.guestListTitleSuffix}
        </span>
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid"
        >
          {brand.labels.guestListNewButton}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-sk-container-low text-[11px] font-semibold uppercase tracking-wider text-sk-ink/55">
            <tr>
              <th className="px-4 py-3">{brand.labels.labelName}</th>
              <th className="px-4 py-3 hidden sm:table-cell">
                {brand.labels.labelEmail}
              </th>
              <th className="px-4 py-3">{brand.labels.guestListPhoneAbbrev}</th>
              <th className="px-4 py-3 hidden md:table-cell">
                {brand.labels.guestListCityAbbrev}
              </th>
              <th className="px-4 py-3 hidden lg:table-cell">
                {brand.labels.labelCompany}
              </th>
              <th className="px-4 py-3">
                {brand.labels.clientSkillFilterLabel}
              </th>
              <th className="px-4 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3 hidden md:table-cell">
                {brand.labels.guestListLastBookingPrefix}{" "}
                {brand.labels.bookingSingular}
              </th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g, i) => (
              <tr
                key={g.id}
                className={`cursor-pointer transition-colors hover:bg-sk-container-low/70 ${
                  i % 2 === 0 ? "bg-white" : "bg-sk-surface/80"
                } ${selectedId === g.id ? "!bg-sk-highlight" : ""}`}
                onClick={() => onSelect(g.id)}
              >
                <td className="px-4 py-2.5 font-medium text-sk-ink">{g.name}</td>
                <td className="px-4 py-2.5 text-sk-ink/70 hidden sm:table-cell">
                  {g.email ?? brand.labels.uiEmDash}
                </td>
                <td className="px-4 py-2.5 text-sk-ink/70">
                  {g.phone ?? brand.labels.uiEmDash}
                </td>
                <td className="px-4 py-2.5 text-sk-ink/65 hidden md:table-cell">
                  {g.city ?? brand.labels.uiEmDash}
                </td>
                <td className="px-4 py-2.5 text-sk-ink/60 hidden lg:table-cell">
                  {g.company ?? brand.labels.uiEmDash}
                </td>
                <td className="px-4 py-2.5 text-xs capitalize">{g.niveau}</td>
                <td className="px-4 py-2.5 text-center text-xs text-sk-ink/70">
                  {g.bookingCount}
                </td>
                <td className="px-4 py-2.5 text-xs text-sk-ink/60 hidden md:table-cell">
                  {g.lastBookingDate ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guests.length === 0 ? (
          <p className="p-6 text-center text-sm text-sk-ink/50">
            {brand.labels.guestListEmptyTemplate.replace(
              "{clients}",
              brand.labels.clientPlural
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
