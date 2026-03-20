"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { GuestContactKind, GuestNiveau, GuestWithBookings } from "../types";
import { useGuestMutations } from "../hooks/useGuests";

const KIND_LABELS: Record<GuestContactKind, string> = {
  note: "Notiz",
  call: "Anruf",
  email: "E-Mail",
  meeting: "Treffen",
};

export function GuestDetailPanel({
  guest,
  onMutate,
  onDeleted,
}: {
  guest: GuestWithBookings;
  onMutate: () => void;
  onDeleted?: () => void;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const { update, remove, addContact } = useGuestMutations();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone ?? "");
  const [niveau, setNiveau] = useState<GuestNiveau>(guest.niveau);
  const [language, setLanguage] = useState(guest.language);
  const [company, setCompany] = useState(guest.company ?? "");
  const [crmSource, setCrmSource] = useState(guest.crmSource ?? "");
  const [notes, setNotes] = useState(guest.notes ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [contactKind, setContactKind] = useState<GuestContactKind>("note");
  const [contactBody, setContactBody] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactErr, setContactErr] = useState<string | null>(null);

  useEffect(() => {
    setContactBody("");
    setContactKind("note");
    setContactErr(null);
    setEditing(false);
    setErr(null);
  }, [guest.id]);

  useEffect(() => {
    setName(guest.name);
    setEmail(guest.email ?? "");
    setPhone(guest.phone ?? "");
    setNiveau(guest.niveau);
    setLanguage(guest.language);
    setCompany(guest.company ?? "");
    setCrmSource(guest.crmSource ?? "");
    setNotes(guest.notes ?? "");
  }, [
    guest.id,
    guest.name,
    guest.email,
    guest.phone,
    guest.niveau,
    guest.language,
    guest.company,
    guest.crmSource,
    guest.notes,
  ]);

  async function save() {
    setErr(null);
    try {
      await update(guest.id, {
        name,
        email: email.trim() || null,
        phone: phone.trim() || null,
        niveau,
        language: language.trim() || "de",
        notes: notes.trim() || null,
        company: company.trim() || null,
        crmSource: crmSource.trim() || null,
      });
      setEditing(false);
      onMutate();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    }
  }

  async function submitContact() {
    setContactErr(null);
    const body = contactBody.trim();
    if (body.length < 1) {
      setContactErr("Text erforderlich");
      return;
    }
    setContactLoading(true);
    try {
      await addContact(guest.id, { kind: contactKind, body });
      setContactBody("");
      onMutate();
    } catch (e) {
      setContactErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setContactLoading(false);
    }
  }

  async function del() {
    if (!isAdmin) return;
    if (!confirm("Gast endgültig löschen?")) return;
    try {
      await remove(guest.id);
      onDeleted?.();
      onMutate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-lg border border-sk-ink/10 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-sk-ink">{guest.name}</h2>
          {guest.openInvoicesCount > 0 ? (
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
              {guest.openInvoicesCount} offene Rechnung
              {guest.openInvoicesCount > 1 ? "en" : ""}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm text-sk-brand hover:underline"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Abbrechen" : "Bearbeiten"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 text-sm">
          <label className="block text-sk-ink">
            Name
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            E-Mail
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            Telefon
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            Firma
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            CRM-Quelle (z. B. Website, Empfehlung)
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={crmSource}
              onChange={(e) => setCrmSource(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            Niveau
            <select
              className="mt-1 w-full rounded border px-2 py-2"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as GuestNiveau)}
            >
              <option value="anfaenger">Anfänger</option>
              <option value="fortgeschritten">Fortgeschritten</option>
              <option value="experte">Experte</option>
            </select>
          </label>
          <label className="block text-sk-ink">
            Sprache
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="de"
            />
          </label>
          <label className="block text-sk-ink">
            Notizen
            <textarea
              className="mt-1 w-full rounded border px-2 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button
            type="button"
            className="rounded bg-sk-brand px-3 py-2 text-white"
            onClick={() => void save()}
          >
            Speichern
          </button>
        </div>
      ) : (
        <dl className="space-y-2 text-sm text-sk-ink">
          <div>
            <dt className="text-sk-ink/50">E-Mail</dt>
            <dd>{guest.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">Telefon</dt>
            <dd>{guest.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">Firma</dt>
            <dd>{guest.company ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">CRM-Quelle</dt>
            <dd>{guest.crmSource ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">Niveau</dt>
            <dd className="capitalize">{guest.niveau}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">Sprache</dt>
            <dd>{guest.language}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">Notizen</dt>
            <dd className="whitespace-pre-wrap">{guest.notes ?? "—"}</dd>
          </div>
        </dl>
      )}

      <div className="mt-4 border-t border-sk-ink/10 pt-4">
        <h3 className="text-sm font-medium text-sk-ink">Aktivität &amp; Kontakte</h3>
        <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm">
          {guest.contacts.map((c) => (
            <li
              key={c.id}
              className="rounded border border-sk-ink/10 px-2 py-2 text-sk-ink/90"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs text-sk-ink/50">
                <span>
                  {new Date(c.createdAt).toLocaleString("de-CH", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
                <span>
                  {KIND_LABELS[c.kind]} · {c.authorName ?? "Team"}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sk-ink">{c.body}</p>
            </li>
          ))}
        </ul>
        {guest.contacts.length === 0 ? (
          <p className="text-xs text-sk-ink/50">Noch keine Einträge.</p>
        ) : null}
        <div className="mt-3 space-y-2 border-t border-sk-ink/10 pt-3">
          <label className="block text-xs text-sk-ink/70">
            Neuer Eintrag
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm text-sk-ink"
              value={contactKind}
              onChange={(e) => setContactKind(e.target.value as GuestContactKind)}
            >
              {(Object.keys(KIND_LABELS) as GuestContactKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <textarea
            className="w-full rounded border px-2 py-2 text-sm"
            rows={3}
            placeholder="Gespräch, Follow-up, interne Notiz …"
            value={contactBody}
            onChange={(e) => setContactBody(e.target.value)}
          />
          {contactErr ? <p className="text-xs text-red-600">{contactErr}</p> : null}
          <button
            type="button"
            disabled={contactLoading}
            className="rounded bg-sk-brand px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void submitContact()}
          >
            {contactLoading ? "…" : "Eintrag speichern"}
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-sk-ink/10 pt-4">
        <h3 className="text-sm font-medium text-sk-ink">Buchungen</h3>
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
          {guest.bookings.map((b) => (
            <li
              key={b.id}
              className="rounded border border-sk-ink/10 px-2 py-2 text-sk-ink/90"
            >
              <div className="font-medium">
                {b.date} {b.startTime.slice(0, 5)} · {b.courseTypeName}
              </div>
              <div className="text-xs text-sk-ink/60">
                {b.teacherName} · {b.status} · {b.priceCHF} CHF
              </div>
            </li>
          ))}
        </ul>
        {guest.bookings.length === 0 ? (
          <p className="text-xs text-sk-ink/50">Noch keine Buchungen.</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-sk-ink/10 pt-4">
        <Link
          href={`/kalender?guestId=${guest.id}`}
          className="rounded border border-sk-brand px-3 py-2 text-sm text-sk-brand hover:bg-[#E8F0FA]"
        >
          Neuer Termin (Kalender)
        </Link>
        {isAdmin ? (
          <button
            type="button"
            className="rounded border border-red-200 px-3 py-2 text-sm text-red-700"
            onClick={() => void del()}
          >
            Löschen
          </button>
        ) : null}
      </div>
    </div>
  );
}
