"use client";

import { useEffect, useState } from "react";
import { brand } from "@/config/brand";
import { GuestCreateModal } from "./GuestCreateModal";
import { GuestDetailPanel } from "./GuestDetailPanel";
import { GuestList } from "./GuestList";
import { useGuestDetail, useGuestList } from "../hooks/useGuests";

export function GuestsPageClient() {
  const [searchInput, setSearchInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [niveau, setNiveau] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { guests, mutate: mutateList, isLoading } = useGuestList(
    debounced,
    niveau
  );
  const { guest, mutate: mutateDetail } = useGuestDetail(selectedId);

  const refresh = () => {
    void mutateList();
    void mutateDetail();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-sk-ink">
          {brand.labels.labelSearch}
          <input
            type="search"
            className="mt-1 block w-56 rounded border border-sk-ink/20 px-2 py-2"
            placeholder={brand.labels.placeholderClientSearch}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="text-sm text-sk-ink">
          {brand.labels.clientSkillFilterLabel}
          <select
            className="mt-1 block rounded border border-sk-ink/20 px-2 py-2"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
          >
            <option value="">{brand.labels.uiFilterAll}</option>
            <option value="anfaenger">{brand.labels.niveauAnfaenger}</option>
            <option value="fortgeschritten">
              {brand.labels.niveauFortgeschritten}
            </option>
            <option value="experte">{brand.labels.niveauExperte}</option>
          </select>
        </label>
        {isLoading ? (
          <span className="text-xs text-sk-ink/50">
            {brand.labels.uiLoadingEllipsis}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GuestList
          guests={guests}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={() => setCreateOpen(true)}
        />
        {guest ? (
          <div className="hidden lg:block">
            <GuestDetailPanel
              guest={guest}
              onMutate={refresh}
              onDeleted={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <div className="hidden rounded-lg border border-dashed border-sk-ink/20 p-8 text-center text-sm text-sk-ink/50 lg:block">
            {brand.labels.guestPageSelectClientHintTemplate.replace(
              "{client}",
              brand.labels.clientSingular
            )}
          </div>
        )}
      </div>

      {guest ? (
        <div className="lg:hidden">
          <GuestDetailPanel
            guest={guest}
            onMutate={refresh}
            onDeleted={() => setSelectedId(null)}
          />
        </div>
      ) : null}

      <GuestCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void mutateList()}
      />
    </div>
  );
}
