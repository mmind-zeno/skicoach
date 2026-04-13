"use client";

import { useAppToast } from "@/components/app-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { GuestContactKind, GuestNiveau, GuestWithBookings } from "../types";
import { useGuestMutations } from "../hooks/useGuests";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { brand } from "@/config/brand";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { appDateTimeLocale } from "@/lib/locale";

function niveauDisplayLabel(n: GuestNiveau): string {
  switch (n) {
    case "anfaenger":
      return brand.labels.niveauAnfaenger;
    case "fortgeschritten":
      return brand.labels.niveauFortgeschritten;
    case "experte":
      return brand.labels.niveauExperte;
    default:
      return n;
  }
}

export function GuestDetailPanel({
  guest,
  onMutate,
  onDeleted,
}: {
  guest: GuestWithBookings;
  onMutate: () => void;
  onDeleted?: () => void;
}) {
  const { showToast } = useAppToast();
  const kindLabels: Record<GuestContactKind, string> = {
    note: brand.labels.guestContactKindNote,
    call: brand.labels.guestContactKindCall,
    email: brand.labels.guestContactKindEmail,
    meeting: brand.labels.guestContactKindMeeting,
  };

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
  const [err, setErr] = useState<UiErrorInfo | null>(null);
  const [contactKind, setContactKind] = useState<GuestContactKind>("note");
  const [contactBody, setContactBody] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactErr, setContactErr] = useState<UiErrorInfo | null>(null);
  const [actionErr, setActionErr] = useState<UiErrorInfo | null>(null);

  useEffect(() => {
    setContactBody("");
    setContactKind("note");
    setContactErr(null);
    setEditing(false);
    setErr(null);
    setActionErr(null);
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
        language: language.trim() || brand.defaultGuestLanguage,
        notes: notes.trim() || null,
        company: company.trim() || null,
        crmSource: crmSource.trim() || null,
      });
      setEditing(false);
      onMutate();
    } catch (e) {
      setErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
    }
  }

  async function submitContact() {
    setContactErr(null);
    const body = contactBody.trim();
    if (body.length < 1) {
      setContactErr({ message: brand.labels.uiContactTextRequired });
      return;
    }
    setContactLoading(true);
    try {
      await addContact(guest.id, { kind: contactKind, body });
      setContactBody("");
      showToast(brand.labels.guestContactSavedToast, "success");
      onMutate();
    } catch (e) {
      setContactErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
    } finally {
      setContactLoading(false);
    }
  }

  async function del() {
    if (!isAdmin) return;
    if (
      !confirm(
        brand.labels.guestConfirmDeletePermanentTemplate.replace(
          "{client}",
          brand.labels.clientSingular
        )
      )
    )
      return;
    try {
      setActionErr(null);
      await remove(guest.id);
      onDeleted?.();
      onMutate();
    } catch (e) {
      setActionErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
    }
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-lg border border-sk-ink/10 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-sk-ink">{guest.name}</h2>
          {guest.openInvoicesCount > 0 ? (
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
              {guest.openInvoicesCount}{" "}
              {brand.labels.guestOpenInvoicesAdj}{" "}
              {guest.openInvoicesCount === 1
                ? brand.labels.invoiceSingular
                : brand.labels.invoicePlural}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm text-sk-brand hover:underline"
            onClick={() => setEditing(!editing)}
          >
            {editing
              ? brand.labels.uiCancel
              : brand.labels.uiEdit}
          </button>
        </div>
      </div>
      {actionErr ? (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {actionErr.message}
          {actionErr.requestId ? (
            <span className="block text-xs text-red-700/80">
              Ref: {actionErr.requestId}
            </span>
          ) : null}
        </p>
      ) : null}

      {editing ? (
        <div className="space-y-2 text-sm">
          <label className="block text-sk-ink">
            {brand.labels.labelName}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelEmail}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelPhone}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelCompany}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.guestCrmSourceLabelExtended}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={crmSource}
              onChange={(e) => setCrmSource(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.clientSkillFilterLabel}
            <select
              className="mt-1 w-full rounded border px-2 py-2"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as GuestNiveau)}
            >
              <option value="anfaenger">
                {brand.labels.niveauAnfaenger}
              </option>
              <option value="fortgeschritten">
                {brand.labels.niveauFortgeschritten}
              </option>
              <option value="experte">{brand.labels.niveauExperte}</option>
            </select>
          </label>
          <label className="block text-sk-ink">
            {brand.labels.labelLanguage}
            <input
              className="mt-1 w-full rounded border px-2 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder={brand.labels.guestPlaceholderLanguage}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.fieldNotes}
            <textarea
              className="mt-1 w-full rounded border px-2 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {err ? (
            <p className="text-sm text-red-600" role="alert">
              {err.message}
              {err.requestId ? (
                <span className="block text-xs text-red-700/80">
                  Ref: {err.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <button
            type="button"
            className="rounded bg-sk-brand px-3 py-2 text-white"
            onClick={() => void save()}
          >
            {brand.labels.uiSave}
          </button>
        </div>
      ) : (
        <dl className="space-y-2 text-sm text-sk-ink">
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelEmail}</dt>
            <dd>{guest.email ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelPhone}</dt>
            <dd>{guest.phone ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelCompany}</dt>
            <dd>{guest.company ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelCrmSource}</dt>
            <dd>{guest.crmSource ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">
              {brand.labels.clientSkillFilterLabel}
            </dt>
            <dd>{niveauDisplayLabel(guest.niveau)}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelLanguage}</dt>
            <dd>{guest.language}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.fieldNotes}</dt>
            <dd className="whitespace-pre-wrap">
              {guest.notes ?? brand.labels.uiEmDash}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-4 border-t border-sk-ink/10 pt-4">
        <h3 className="text-sm font-medium text-sk-ink">
          {brand.labels.guestActivityHeading}
        </h3>
        <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm">
          {guest.contacts.map((c) => (
            <li
              key={c.id}
              className="rounded border border-sk-ink/10 px-2 py-2 text-sk-ink/90"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs text-sk-ink/50">
                <span>
                  {new Date(c.createdAt).toLocaleString(appDateTimeLocale, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
                <span>
                  {kindLabels[c.kind]} ·{" "}
                  {c.authorName ?? brand.labels.navTeam}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sk-ink">{c.body}</p>
            </li>
          ))}
        </ul>
        {guest.contacts.length === 0 ? (
          <p className="text-xs text-sk-ink/50">
            {brand.labels.uiNoEntriesYet}
          </p>
        ) : null}
        <div className="mt-3 space-y-2 border-t border-sk-ink/10 pt-3">
          <label className="block text-xs text-sk-ink/70">
            {brand.labels.guestContactNewEntryLabel}
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm text-sk-ink"
              value={contactKind}
              onChange={(e) => setContactKind(e.target.value as GuestContactKind)}
            >
              {(Object.keys(kindLabels) as GuestContactKind[]).map((k) => (
                <option key={k} value={k}>
                  {kindLabels[k]}
                </option>
              ))}
            </select>
          </label>
          <textarea
            className="w-full rounded border px-2 py-2 text-sm"
            rows={3}
            placeholder={brand.labels.placeholderGuestContactBody}
            value={contactBody}
            onChange={(e) => setContactBody(e.target.value)}
          />
          {contactErr ? (
            <p className="text-xs text-red-600" role="alert">
              {contactErr.message}
              {contactErr.requestId ? (
                <span className="block text-[11px] text-red-700/80">
                  Ref: {contactErr.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <button
            type="button"
            disabled={contactLoading}
            className="rounded bg-sk-brand px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void submitContact()}
          >
            {contactLoading
              ? brand.labels.uiSaveInProgress
              : brand.labels.guestContactSaveButton}
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-sk-ink/10 pt-4">
        <h3 className="text-sm font-medium text-sk-ink">
          {brand.labels.bookingPlural}
        </h3>
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
          {guest.bookings.map((b) => (
            <li
              key={b.id}
              className="rounded border border-sk-ink/10 px-2 py-2 text-sk-ink/90"
            >
              <div className="font-medium">
                {b.date} {b.startTime.slice(0, 5)} · {b.courseTypeName}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sk-ink/60">
                <span>{b.teacherName ?? brand.labels.uiEmDash}</span>
                <span>·</span>
                <StatusBadge variant={b.status} />
                <span>·</span>
                <span>
                  {brand.labels.guestBookingListPriceTemplate
                    .replace("{amount}", b.priceCHF)
                    .replace(
                      "{currency}",
                      brand.labels.invoiceTableCurrency
                    )}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {guest.bookings.length === 0 ? (
          <p className="text-xs text-sk-ink/50">
            {brand.labels.guestNoBookingsYetTemplate.replace(
              "{bookings}",
              brand.labels.bookingPlural
            )}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-sk-ink/10 pt-4">
        <Link
          href={`/kalender?guestId=${guest.id}`}
          className="rounded border border-sk-brand px-3 py-2 text-sm text-sk-brand hover:bg-[#E8F0FA]"
        >
          {brand.labels.guestNewAppointmentCalendarTemplate.replace(
            "{appointment}",
            brand.labels.appointmentSingular
          )}
        </Link>
        {isAdmin ? (
          <button
            type="button"
            className="rounded border border-red-200 px-3 py-2 text-sm text-red-700"
            onClick={() => void del()}
          >
            {brand.labels.uiDelete}
          </button>
        ) : null}
      </div>
    </div>
  );
}
