"use client";

import { useAppToast } from "@/components/app-toast";
import { useState } from "react";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import type {
  GuestGender,
  GuestNiveau,
  GuestPreferredContactChannel,
} from "../types";

const field =
  "mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sm";
const section =
  "mt-4 text-[11px] font-semibold uppercase tracking-wide text-sk-ink/45";

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
  const [salutation, setSalutation] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<GuestGender | "">("");
  const [nationality, setNationality] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [shoeSizeEu, setShoeSizeEu] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [preferredContactChannel, setPreferredContactChannel] = useState<
    GuestPreferredContactChannel | ""
  >("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [bookingReminderOptIn, setBookingReminderOptIn] = useState(true);
  const [err, setErr] = useState<UiErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setNiveau("anfaenger");
    setCompany("");
    setCrmSource("");
    setNotes("");
    setSalutation("");
    setStreet("");
    setPostalCode("");
    setCity("");
    setCountry("");
    setDateOfBirth("");
    setGender("");
    setNationality("");
    setHeightCm("");
    setWeightKg("");
    setShoeSizeEu("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setMedicalNotes("");
    setPreferredContactChannel("");
    setMarketingOptIn(false);
    setBookingReminderOptIn(true);
  }

  async function submit() {
    setErr(null);
    if (name.trim().length < 2) {
      setErr({ message: brand.labels.uiNameRequired });
      return;
    }
    const hi = heightCm.trim() === "" ? undefined : Number.parseInt(heightCm, 10);
    const we = weightKg.trim() === "" ? undefined : Number.parseInt(weightKg, 10);
    if (hi !== undefined && (Number.isNaN(hi) || hi < 50 || hi > 260)) {
      setErr({ message: brand.labels.apiInvalidData });
      return;
    }
    if (we !== undefined && (Number.isNaN(we) || we < 20 || we > 250)) {
      setErr({ message: brand.labels.apiInvalidData });
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
          salutation: salutation.trim() || undefined,
          street: street.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          dateOfBirth: dateOfBirth.trim() || undefined,
          gender: gender === "" ? undefined : gender,
          nationality: nationality.trim() || undefined,
          heightCm: hi,
          weightKg: we,
          shoeSizeEu: shoeSizeEu.trim() || undefined,
          emergencyContactName: emergencyContactName.trim() || undefined,
          emergencyContactPhone: emergencyContactPhone.trim() || undefined,
          medicalNotes: medicalNotes.trim() || undefined,
          preferredContactChannel:
            preferredContactChannel === "" ? undefined : preferredContactChannel,
          marketingOptIn,
        }),
      });
      reset();
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
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
        <div className="shrink-0 border-b border-sk-ink/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.guestCreateModalTitleTemplate.replace(
              "{clientSingular}",
              brand.labels.clientSingular
            )}
          </h2>
          <p className="mt-1 text-xs text-sk-ink/60">
            {brand.labels.labelName} · {brand.labels.guestCrmSectionAddress} · …
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className={section}>{brand.labels.guestCrmSectionContact}</p>
          <div className="mt-2 space-y-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.labelName} *
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelEmail}
              <input
                type="email"
                className={field}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelPhone}
              <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelCompany}
              <input className={field} value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.labelCrmSource}
              <input
                className={field}
                value={crmSource}
                onChange={(e) => setCrmSource(e.target.value)}
                placeholder={brand.labels.placeholderCrmSourceExample}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmPreferredContact}
              <select
                className={field}
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
            <label className="flex cursor-pointer items-center gap-2 text-sk-ink">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-sk-ink/30"
              />
              {brand.labels.guestCrmMarketingOptIn}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sk-ink">
              <input
                type="checkbox"
                checked={bookingReminderOptIn}
                onChange={(e) => setBookingReminderOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-sk-ink/30"
              />
              {brand.labels.guestCrmBookingReminderOptIn}
            </label>
          </div>

          <p className={section}>{brand.labels.guestCrmSectionAddress}</p>
          <div className="mt-2 space-y-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmStreet}
              <input className={field} value={street} onChange={(e) => setStreet(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sk-ink">
                {brand.labels.guestCrmPostalCode}
                <input
                  className={field}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </label>
              <label className="block text-sk-ink">
                {brand.labels.guestCrmCity}
                <input className={field} value={city} onChange={(e) => setCity(e.target.value)} />
              </label>
            </div>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmCountry}
              <input
                className={field}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <p className={section}>{brand.labels.guestCrmSectionPerson}</p>
          <div className="mt-2 space-y-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmSalutation}
              <input
                className={field}
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                placeholder={brand.labels.guestCrmSalutationPlaceholder}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmDateOfBirth}
              <input
                type="date"
                className={field}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmGender}
              <select
                className={field}
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
                className={field}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.clientSkillFilterLabel}
              <select
                className={field}
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
          </div>

          <p className={section}>{brand.labels.guestCrmSectionEquipment}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmHeightCm}
              <input
                type="number"
                min={50}
                max={260}
                className={field}
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
                className={field}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink sm:col-span-1">
              {brand.labels.guestCrmShoeSizeEu}
              <input
                className={field}
                value={shoeSizeEu}
                onChange={(e) => setShoeSizeEu(e.target.value)}
                placeholder="42"
              />
            </label>
          </div>

          <p className={section}>{brand.labels.guestCrmSectionEmergency}</p>
          <div className="mt-2 space-y-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmEmergencyName}
              <input
                className={field}
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.guestCrmEmergencyPhone}
              <input
                className={field}
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </label>
          </div>

          <p className={section}>{brand.labels.guestCrmSectionOther}</p>
          <div className="mt-2 space-y-3 text-sm">
            <label className="block text-sk-ink">
              {brand.labels.guestCrmMedicalNotes}
              <textarea
                className={field}
                rows={2}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
              />
            </label>
            <label className="block text-sk-ink">
              {brand.labels.fieldNotes}
              <textarea
                className={field}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
        </div>
        {err ? (
          <p className="px-5 text-sm text-red-600" role="alert">
            {err.message}
            {err.requestId ? (
              <span className="block text-xs text-red-700/80">
                Ref: {err.requestId}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="flex shrink-0 justify-end gap-2 border-t border-sk-ink/10 px-5 py-4">
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
