"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [niveau, setNiveau] = useState<GuestNiveau>("anfaenger");
  const [company, setCompany] = useState("");
  const [crmSource, setCrmSource] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    if (name.trim().length < 2) {
      setErr(brand.labels.uiNameRequired);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/guests", {
        method: "POST",
        credentials: "same-origin",
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
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(
          (j as { error?: string }).error ?? brand.labels.uiErrorGeneric
        );
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setCrmSource("");
      setNotes("");
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-sk-ink">
          Neuer {brand.labels.clientSingular}
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
            E-Mail
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
            Firma
            <input
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            CRM-Quelle
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
            Notizen
            <textarea
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
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
            className="rounded bg-sk-brand px-3 py-2 text-white hover:bg-sk-hover disabled:opacity-50"
            onClick={() => void submit()}
          >
            {brand.labels.uiSave}
          </button>
        </div>
      </div>
    </div>
  );
}
