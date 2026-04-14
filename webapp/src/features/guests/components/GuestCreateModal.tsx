"use client";

import { useAppToast } from "@/components/app-toast";
import { useState } from "react";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import type { GuestNiveau } from "../types";

export function GuestCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useAppToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [niveau, setNiveau] = useState<GuestNiveau>("anfaenger");
  const [company, setCompany] = useState("");
  const [crmSource, setCrmSource] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<UiErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    if (name.trim().length < 2) {
      setErr({ message: brand.labels.uiNameRequired });
      return;
    }
    setLoading(true);
    try {
      await fetchJson("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          niveau,
          company: company.trim() || undefined,
          crmSource: crmSource.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setCrmSource("");
      setNotes("");
      showToast(
        brand.labels.guestCreatedToastTemplate.replace(
          "{clientSingular}",
          brand.labels.clientSingular
        ),
        "success"
      );
      onCreated();
      onClose();
    } catch (e) {
      setErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-sk-ink">
          {brand.labels.guestCreateModalTitleTemplate.replace(
            "{clientSingular}",
            brand.labels.clientSingular
          )}
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block text-sk-ink">
            Name *
            <input
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelEmail}
            <input
              type="email"
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            Telefon
            <input
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelCompany}
            <input
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelCrmSource}
            <input
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={crmSource}
              onChange={(e) => setCrmSource(e.target.value)}
              placeholder={brand.labels.placeholderCrmSourceExample}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.clientSkillFilterLabel}
            <select
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as GuestNiveau)}
            >
              <option value="anfaenger">{brand.labels.niveauAnfaenger}</option>
              <option value="fortgeschritten">
                {brand.labels.niveauFortgeschritten}
              </option>
              <option value="experte">{brand.labels.niveauExperte}</option>
            </select>
          </label>
          <label className="block text-sk-ink">
            {brand.labels.fieldNotes}
            <textarea
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        {err ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {err.message}
            {err.requestId ? (
              <span className="block text-xs text-red-700/80">
                Ref: {err.requestId}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-2 text-sk-ink hover:bg-sk-surface"
            onClick={onClose}
          >
            {brand.labels.uiCancel}
          </button>
          <button
            type="button"
            disabled={loading}
            className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
            onClick={() => void submit()}
          >
            {brand.labels.uiSave}
          </button>
        </div>
      </div>
    </div>
  );
}
