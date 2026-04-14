"use client";

import { useEffect, useState } from "react";
import { ProductPreviewGuestDetail } from "@/components/ui/product-ui-previews";
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

  const {
    guests,
    mutate: mutateList,
    isLoading,
    error: listError,
  } = useGuestList(debounced, niveau);
  const {
    guest,
    mutate: mutateDetail,
    error: detailError,
  } = useGuestDetail(selectedId);

  const refresh = () => {
    void mutateList();
    void mutateDetail();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-sk-ink">
          {brand.labels.labelSearch}
          <input
            type="search"
            className="sk-field mt-1.5 block w-56 min-w-0"
            placeholder={brand.labels.placeholderClientSearch}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-sk-ink">
          {brand.labels.clientSkillFilterLabel}
          <select
            className="sk-field mt-1.5 block min-w-[10rem]"
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
        {listError ? (
          <div className="flex w-full max-w-md flex-wrap items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 md:ml-auto">
            <span className="min-w-0 flex-1">{listError.message}</span>
            <button
              type="button"
              className="shrink-0 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-100"
              onClick={() => void mutateList()}
            >
              {brand.labels.uiRefresh}
            </button>
          </div>
        ) : null}
      </div>

      {detailError && selectedId ? (
        <div className="flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <span className="min-w-0 flex-1">{detailError.message}</span>
          <button
            type="button"
            className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100"
            onClick={() => void mutateDetail()}
          >
            {brand.labels.uiRefresh}
          </button>
        </div>
      ) : null}

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
          <div className="hidden flex-col gap-4 rounded-2xl border border-sk-outline/20 bg-gradient-to-br from-sk-highlight/40 to-sk-container-high/50 p-6 shadow-[inset_0_0_0_1px_rgba(225,191,181,0.18)] lg:flex">
            <div className="mx-auto max-w-sm">
              <ProductPreviewGuestDetail />
            </div>
            <p className="text-center text-sm text-sk-ink/60">
              {brand.labels.guestPageSelectClientHintTemplate.replace(
                "{client}",
                brand.labels.clientSingular
              )}
            </p>
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
