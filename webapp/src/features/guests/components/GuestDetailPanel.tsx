"use client";

import { useAppToast } from "@/components/app-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type {
  GuestContactKind,
  GuestGender,
  GuestNiveau,
  GuestPreferredContactChannel,
  GuestWithBookings,
} from "../types";
import { useGuestMutations } from "../hooks/useGuests";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { brand } from "@/config/brand";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { appDateTimeLocale } from "@/lib/locale-shared";

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

function genderLabel(g: GuestGender | null): string {
  if (!g) return brand.labels.uiEmDash;
  switch (g) {
    case "weiblich":
      return brand.labels.guestGenderWeiblich;
    case "maennlich":
      return brand.labels.guestGenderMaennlich;
    case "divers":
      return brand.labels.guestGenderDivers;
    case "unbekannt":
      return brand.labels.guestGenderUnbekannt;
    default:
      return g;
  }
}

function channelLabel(c: GuestPreferredContactChannel | null): string {
  if (!c) return brand.labels.uiEmDash;
  switch (c) {
    case "email":
      return brand.labels.guestContactChannelEmail;
    case "phone":
      return brand.labels.guestContactChannelPhone;
    case "sms":
      return brand.labels.guestContactChannelSms;
    case "whatsapp":
      return brand.labels.guestContactChannelWhatsapp;
    default:
      return c;
  }
}

function formatStreetCity(g: GuestWithBookings): string {
  const line = [g.postalCode, g.city].filter(Boolean).join(" ");
  const parts = [g.street, line, g.country].filter(Boolean);
  return parts.length ? parts.join(", ") : brand.labels.uiEmDash;
}

const inputCls = "mt-1 w-full rounded border border-sk-ink/20 px-2 py-2";
const sectionCls =
  "col-span-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-sk-ink/45";

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
  const [salutation, setSalutation] = useState(guest.salutation ?? "");
  const [street, setStreet] = useState(guest.street ?? "");
  const [postalCode, setPostalCode] = useState(guest.postalCode ?? "");
  const [city, setCity] = useState(guest.city ?? "");
  const [country, setCountry] = useState(guest.country ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(guest.dateOfBirth ?? "");
  const [gender, setGender] = useState<GuestGender | "">(guest.gender ?? "");
  const [nationality, setNationality] = useState(guest.nationality ?? "");
  const [heightCm, setHeightCm] = useState(
    guest.heightCm != null ? String(guest.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    guest.weightKg != null ? String(guest.weightKg) : ""
  );
  const [shoeSizeEu, setShoeSizeEu] = useState(guest.shoeSizeEu ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    guest.emergencyContactName ?? ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    guest.emergencyContactPhone ?? ""
  );
  const [medicalNotes, setMedicalNotes] = useState(guest.medicalNotes ?? "");
  const [preferredContactChannel, setPreferredContactChannel] = useState<
    GuestPreferredContactChannel | ""
  >(guest.preferredContactChannel ?? "");
  const [marketingOptIn, setMarketingOptIn] = useState(guest.marketingOptIn);
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
    setSalutation(guest.salutation ?? "");
    setStreet(guest.street ?? "");
    setPostalCode(guest.postalCode ?? "");
    setCity(guest.city ?? "");
    setCountry(guest.country ?? "");
    setDateOfBirth(guest.dateOfBirth ?? "");
    setGender(guest.gender ?? "");
    setNationality(guest.nationality ?? "");
    setHeightCm(guest.heightCm != null ? String(guest.heightCm) : "");
    setWeightKg(guest.weightKg != null ? String(guest.weightKg) : "");
    setShoeSizeEu(guest.shoeSizeEu ?? "");
    setEmergencyContactName(guest.emergencyContactName ?? "");
    setEmergencyContactPhone(guest.emergencyContactPhone ?? "");
    setMedicalNotes(guest.medicalNotes ?? "");
    setPreferredContactChannel(guest.preferredContactChannel ?? "");
    setMarketingOptIn(guest.marketingOptIn);
  }, [guest]);

  async function save() {
    setErr(null);
    const hi = heightCm.trim() === "" ? null : Number.parseInt(heightCm, 10);
    const we = weightKg.trim() === "" ? null : Number.parseInt(weightKg, 10);
    if (hi !== null && (Number.isNaN(hi) || hi < 50 || hi > 260)) {
      setErr({ message: brand.labels.apiInvalidData });
      return;
    }
    if (we !== null && (Number.isNaN(we) || we < 20 || we > 250)) {
      setErr({ message: brand.labels.apiInvalidData });
      return;
    }
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
        salutation: salutation.trim() || null,
        street: street.trim() || null,
        postalCode: postalCode.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        dateOfBirth: dateOfBirth.trim() || null,
        gender: gender === "" ? null : gender,
        nationality: nationality.trim() || null,
        heightCm: hi,
        weightKg: we,
        shoeSizeEu: shoeSizeEu.trim() || null,
        emergencyContactName: emergencyContactName.trim() || null,
        emergencyContactPhone: emergencyContactPhone.trim() || null,
        medicalNotes: medicalNotes.trim() || null,
        preferredContactChannel:
          preferredContactChannel === "" ? null : preferredContactChannel,
        marketingOptIn,
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
    <div className="sk-surface-card flex h-full min-h-[420px] flex-col p-5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-sk-ink">{guest.name}</h2>
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
        <div className="max-h-[min(70vh,520px)] space-y-1 overflow-y-auto pr-1 text-sm">
          <p className={sectionCls}>{brand.labels.guestCrmSectionContact}</p>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-3">
            <label className="block text-sk-ink sm:col-span-2">
              {brand.labels.labelName}
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelEmail}
              <input
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelPhone}
              <input
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelCompany}
              <input
                className={inputCls}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmSourceLabelExtended}
              <input
                className={inputCls}
                value={crmSource}
                onChange={(e) => setCrmSource(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmPreferredContact}
              <select
                className={inputCls}
                value={preferredContactChannel}
                onChange={(e) =>
                  setPreferredContactChannel(
                    e.target.value as GuestPreferredContactChannel | ""
                  )
                }
              >
                <option value="">—</option>
                <option value="email">{brand.labels.guestContactChannelEmail}</option>
                <option value="phone">{brand.labels.guestContactChannelPhone}</option>
                <option value="sms">{brand.labels.guestContactChannelSms}</option>
                <option value="whatsapp">
                  {brand.labels.guestContactChannelWhatsapp}
                </option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 pt-6 text-sk-ink sm:col-span-2">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-sk-ink/30"
              />
              {brand.labels.guestCrmMarketingOptIn}
            </label>
          </div>

          <p className={sectionCls}>{brand.labels.guestCrmSectionAddress}</p>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-3">
            <label className="block text-sk-ink sm:col-span-2">
              {brand.labels.guestCrmStreet}
              <input
                className={inputCls}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmPostalCode}
              <input
                className={inputCls}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmCity}
              <input
                className={inputCls}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink sm:col-span-2">
              {brand.labels.guestCrmCountry}
              <input
                className={inputCls}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <p className={sectionCls}>{brand.labels.guestCrmSectionPerson}</p>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-3">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmSalutation}
              <input
                className={inputCls}
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                placeholder={brand.labels.guestCrmSalutationPlaceholder}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmDateOfBirth}
              <input
                type="date"
                className={inputCls}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmGender}
              <select
                className={inputCls}
                value={gender}
                onChange={(e) => setGender(e.target.value as GuestGender | "")}
              >
                <option value="">—</option>
                <option value="weiblich">{brand.labels.guestGenderWeiblich}</option>
                <option value="maennlich">{brand.labels.guestGenderMaennlich}</option>
                <option value="divers">{brand.labels.guestGenderDivers}</option>
                <option value="unbekannt">{brand.labels.guestGenderUnbekannt}</option>
              </select>
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmNationality}
              <input
                className={inputCls}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.clientSkillFilterLabel}
              <select
                className={inputCls}
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
                className={inputCls}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder={brand.labels.guestPlaceholderLanguage}
              />
            </label>
          </div>

          <p className={sectionCls}>{brand.labels.guestCrmSectionEquipment}</p>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-x-3">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmHeightCm}
              <input
                type="number"
                min={50}
                max={260}
                className={inputCls}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmWeightKg}
              <input
                type="number"
                min={20}
                max={250}
                className={inputCls}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmShoeSizeEu}
              <input
                className={inputCls}
                value={shoeSizeEu}
                onChange={(e) => setShoeSizeEu(e.target.value)}
                placeholder="42"
              />
            </label>
          </div>

          <p className={sectionCls}>{brand.labels.guestCrmSectionEmergency}</p>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-3">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmEmergencyName}
              <input
                className={inputCls}
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmEmergencyPhone}
              <input
                className={inputCls}
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </label>
          </div>

          <p className={sectionCls}>{brand.labels.guestCrmSectionOther}</p>
          <label className="block text-sk-ink">
            {brand.labels.guestCrmMedicalNotes}
            <textarea
              className={inputCls}
              rows={2}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
            />
          </label>
          <label className="block text-sk-ink">
            {brand.labels.fieldNotes}
            <textarea
              className={inputCls}
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
            className="mt-2 rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-white shadow-sm hover:from-sk-cta-hover hover:to-sk-cta-mid"
            onClick={() => void save()}
          >
            {brand.labels.uiSave}
          </button>
        </div>
      ) : (
        <dl className="space-y-3 text-sm text-sk-ink">
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelEmail}</dt>
            <dd>{guest.email ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.labelPhone}</dt>
            <dd>{guest.phone ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmPreferredContact}</dt>
            <dd>{channelLabel(guest.preferredContactChannel)}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmMarketingOptIn}</dt>
            <dd>{guest.marketingOptIn ? brand.labels.uiYes : brand.labels.uiNo}</dd>
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
            <dt className="text-sk-ink/50">{brand.labels.guestCrmSectionAddress}</dt>
            <dd className="whitespace-pre-wrap">{formatStreetCity(guest)}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmSalutation}</dt>
            <dd>{guest.salutation ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmDateOfBirth}</dt>
            <dd>{guest.dateOfBirth ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmGender}</dt>
            <dd>{genderLabel(guest.gender)}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmNationality}</dt>
            <dd>{guest.nationality ?? brand.labels.uiEmDash}</dd>
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
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div>
              <dt className="text-sk-ink/50">{brand.labels.guestCrmHeightCm}</dt>
              <dd>{guest.heightCm != null ? guest.heightCm : brand.labels.uiEmDash}</dd>
            </div>
            <div>
              <dt className="text-sk-ink/50">{brand.labels.guestCrmWeightKg}</dt>
              <dd>{guest.weightKg != null ? guest.weightKg : brand.labels.uiEmDash}</dd>
            </div>
            <div>
              <dt className="text-sk-ink/50">{brand.labels.guestCrmShoeSizeEu}</dt>
              <dd>{guest.shoeSizeEu ?? brand.labels.uiEmDash}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmEmergencyName}</dt>
            <dd>{guest.emergencyContactName ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmEmergencyPhone}</dt>
            <dd>{guest.emergencyContactPhone ?? brand.labels.uiEmDash}</dd>
          </div>
          <div>
            <dt className="text-sk-ink/50">{brand.labels.guestCrmMedicalNotes}</dt>
            <dd className="whitespace-pre-wrap">
              {guest.medicalNotes ?? brand.labels.uiEmDash}
            </dd>
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
            className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-sm text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
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
          className="rounded border border-sk-brand/50 px-3 py-2 text-sm text-sk-brand hover:bg-sk-highlight"
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
