"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { PublicTurnstile } from "./PublicTurnstile";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { appDateFnsLocale } from "@/lib/locale-shared";

const TURNSTILE_SITE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Course = {
  id: string;
  name: string;
  durationMin: number;
  priceCHF: string;
  maxParticipants: number;
};

type Avail = Record<string, "free" | "partial" | "full" | "past">;

const COL = {
  free: "#EAF3DE",
  partial: "#FEF3C7",
  full: "#FEE2E2",
  past: "#E5E7EB",
  selected: "#ab3500",
};

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [availability, setAvailability] = useState<Avail>({});
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>(
    []
  );
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [niveau, setNiveau] = useState<
    "anfaenger" | "fortgeschritten" | "experte"
  >("anfaenger");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [err, setErr] = useState<UiErrorInfo | null>(null);
  const [loadErr, setLoadErr] = useState<UiErrorInfo | null>(null);

  const selectedCourse = courses.find((c) => c.id === courseId) ?? null;

  const weekdayShort = useMemo(
    () => [
      brand.labels.calWeekdayMo,
      brand.labels.calWeekdayDi,
      brand.labels.calWeekdayMi,
      brand.labels.calWeekdayDo,
      brand.labels.calWeekdayFr,
      brand.labels.calWeekdaySa,
      brand.labels.calWeekdaySo,
    ],
    []
  );

  const niveauLabels: Record<
    "anfaenger" | "fortgeschritten" | "experte",
    string
  > = useMemo(
    () => ({
      anfaenger: brand.labels.niveauAnfaenger,
      fortgeschritten: brand.labels.niveauFortgeschritten,
      experte: brand.labels.niveauExperte,
    }),
    []
  );

  const availabilityAriaWord = (a: Avail[string]) =>
    a === "free"
      ? brand.labels.publicAvailFree
      : a === "partial"
        ? brand.labels.publicAvailPartial
        : a === "full"
          ? brand.labels.publicAvailFull
          : brand.labels.publicCalNotSelectable;

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchJson<Course[]>("/api/public/course-types");
        setCourses(data);
        setCourseId((id) => id ?? data[0]?.id ?? null);
        setLoadErr(null);
      } catch (e) {
        setCourses([]);
        setCourseId(null);
        setLoadErr(getUiErrorInfo(e, brand.labels.publicWizardCoursesLoadFailed));
      }
    })();
  }, []);

  async function loadMonth(m: Date) {
    if (!courseId) return;
    try {
      const key = format(m, "yyyy-MM");
      const j = await fetchJson<{ availability: Avail }>(
        `/api/public/availability?courseTypeId=${courseId}&month=${key}`
      );
      setAvailability(j.availability ?? {});
      setLoadErr(null);
    } catch (e) {
      setAvailability({});
      setLoadErr(getUiErrorInfo(e, brand.labels.publicWizardAvailabilityLoadFailed));
    }
  }

  async function loadSlots(d: string) {
    if (!courseId) return;
    try {
      const j = await fetchJson<{
        slots: { time: string; available: boolean }[];
      }>(
        `/api/public/slots?courseTypeId=${courseId}&date=${d}`
      );
      setSlots(j.slots ?? []);
      setLoadErr(null);
    } catch (e) {
      setSlots([]);
      setLoadErr(getUiErrorInfo(e, brand.labels.publicWizardSlotsLoadFailed));
    }
  }

  const { pad, days } = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const d = eachDayOfInterval({ start, end });
    const padN = (start.getDay() + 6) % 7;
    return { pad: padN, days: d };
  }, [month]);

  async function submit() {
    setErr(null);
    if (!courseId || !day || !slotTime) {
      setErr({
        message: brand.labels.publicWizardSubmitMissingTemplate.replace(
          "{service}",
          brand.labels.serviceSingular
        ),
      });
      return;
    }
    const guestName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (guestName.length < 2 || !email.includes("@")) {
      setErr({ message: brand.labels.uiValidationNameAndEmail });
      return;
    }
    setLoading(true);
    try {
      const j = await fetchJson<{ requestId?: string }>(
        "/api/public/requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseTypeId: courseId,
            date: day,
            startTime: slotTime.length === 5 ? `${slotTime}:00` : slotTime,
            guestName,
            guestEmail: email.trim(),
            guestPhone: phone.trim() || undefined,
            guestNiveau: niveau,
            message: message.trim() || undefined,
            website: website || undefined,
            turnstileToken: turnstileToken || undefined,
          }),
        }
      );
      setDoneId(j.requestId ?? "ok");
      setStep(4);
      setErr(null);
    } catch (e) {
      setErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setDoneId(null);
    setDay(null);
    setSlotTime(null);
    setSlots([]);
    setErr(null);
    setLoadErr(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <ol
        aria-label={brand.labels.bookingWizardStepperAria}
        className="mb-8 flex list-none justify-center gap-2 text-sm"
      >
        {[1, 2, 3, 4].map((s) => (
          <li key={s} aria-current={s === step ? "step" : undefined}>
            <span className="sr-only">
              {brand.labels.bookingWizardStepStatusTemplate
                .replace("{current}", String(s))
                .replace("{total}", "4")}
            </span>
            <span
              className={`block h-2 w-16 rounded-full ${
                s <= step ? "bg-sk-cta" : "bg-sk-ink/15"
              }`}
              aria-hidden
            />
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section
          className="sk-surface-card p-5 md:p-8"
          aria-labelledby="booking-wizard-step-1-heading"
        >
          <h2
            id="booking-wizard-step-1-heading"
            className="text-xl font-semibold tracking-tight text-sk-ink md:text-2xl"
          >
            {brand.labels.publicWizardPickServiceTypeTemplate.replace(
              "{serviceType}",
              brand.labels.serviceTypeSingular
            )}
          </h2>
          {loadErr ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {loadErr.message}
              {loadErr.requestId ? (
                <span className="block text-xs text-red-700/80">
                  Ref: {loadErr.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <div
            className="mt-4 grid gap-3 sm:grid-cols-2"
            role="group"
            aria-label={brand.labels.publicWizardCoursePickGroupAria}
          >
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={courseId === c.id}
                onClick={() => {
                  setCourseId(c.id);
                }}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  courseId === c.id
                    ? "border-sk-cta bg-sk-highlight"
                    : "border-transparent bg-white shadow hover:border-sk-brand/40"
                }`}
              >
                <div className="font-medium text-sk-cta">{c.name}</div>
                <div className="mt-1 text-sm text-sk-ink/70">
                  {brand.labels.publicBookingCourseMetaTemplate
                    .replace("{durationMin}", String(c.durationMin))
                    .replace("{maxParticipants}", String(c.maxParticipants))
                    .replace("{priceCHF}", c.priceCHF)}
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 rounded-lg bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
            disabled={!courseId}
            onClick={() => {
              setLoadErr(null);
              setStep(2);
              void loadMonth(month);
            }}
          >
            {brand.labels.calNext}
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section
          className="sk-surface-card p-5 md:p-8"
          aria-labelledby="booking-wizard-step-2-heading"
        >
          <h2
            id="booking-wizard-step-2-heading"
            className="text-xl font-semibold tracking-tight text-sk-ink md:text-2xl"
          >
            {brand.labels.publicWizardPickDate}
          </h2>
          {loadErr ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {loadErr.message}
              {loadErr.requestId ? (
                <span className="block text-xs text-red-700/80">
                  Ref: {loadErr.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="text-sk-brand"
              aria-label={brand.labels.calMonthPrevAria}
              onClick={() => {
                const m = addMonths(month, -1);
                setMonth(m);
                void loadMonth(m);
              }}
            >
              ←
            </button>
            <span className="font-medium capitalize" aria-live="polite">
              {format(month, "MMMM yyyy", { locale: appDateFnsLocale })}
            </span>
            <button
              type="button"
              className="text-sk-brand"
              aria-label={brand.labels.calMonthNextAria}
              onClick={() => {
                const m = addMonths(month, 1);
                setMonth(m);
                void loadMonth(m);
              }}
            >
              →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
            {weekdayShort.map((d) => (
              <div key={d} className="py-1 text-sk-ink/50">
                {d}
              </div>
            ))}
            {Array.from({ length: pad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const a = availability[key] ?? "past";
              const selectable = a === "free" || a === "partial";
              const dateLong = format(d, "EEEE, d. MMMM yyyy", {
                locale: appDateFnsLocale,
              });
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!selectable}
                  aria-label={`${dateLong} — ${availabilityAriaWord(a)}`}
                  onClick={() => {
                    setDay(key);
                    void loadSlots(key);
                  }}
                  className="rounded p-2 text-sm disabled:opacity-40"
                  style={{
                    backgroundColor:
                      day === key ? COL.selected : a === "past" ? COL.past : COL[a],
                    color: day === key ? "#fff" : "#181c20",
                  }}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
          <p className="mt-4 flex flex-wrap gap-3 text-xs text-sk-ink/70">
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: COL.free }} />
              {brand.labels.publicAvailFree}
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-3 w-3 rounded"
                style={{ background: COL.partial }}
              />
              {brand.labels.publicAvailPartial}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: COL.full }} />
              {brand.labels.publicAvailFull}
            </span>
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-sk-outline/35 bg-white px-4 py-2 text-sm font-medium text-sk-brand shadow-sm transition hover:bg-sk-highlight"
              onClick={() => {
                setLoadErr(null);
                setStep(1);
              }}
            >
              {brand.labels.calPrevious}
            </button>
            <button
              type="button"
              className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
              disabled={!day}
              onClick={() => {
                setLoadErr(null);
                setErr(null);
                setStep(3);
              }}
            >
              {brand.labels.calNext}
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section
          className="sk-surface-card p-5 md:p-8"
          aria-labelledby="booking-wizard-step-3-heading"
        >
          <h2
            id="booking-wizard-step-3-heading"
            className="text-xl font-semibold tracking-tight text-sk-ink md:text-2xl"
          >
            {brand.labels.publicWizardTimeAndContact}
          </h2>
          {loadErr ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {loadErr.message}
              {loadErr.requestId ? (
                <span className="block text-xs text-red-700/80">
                  Ref: {loadErr.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <div id="booking-wizard-slots-label" className="text-sm font-medium text-sk-ink">
                {brand.labels.publicWizardSlotsTitle}
              </div>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="group"
                aria-labelledby="booking-wizard-slots-label"
              >
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    aria-pressed={slotTime === s.time}
                    aria-label={s.time}
                    onClick={() => setSlotTime(s.time)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      !s.available
                        ? "bg-sk-ink/10 text-sk-ink/40 line-through"
                        : slotTime === s.time
                          ? "bg-sk-cta text-white"
                          : "bg-[#EAF3DE] text-sk-ink"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
              {selectedCourse && slotTime ? (
                <p className="mt-2 text-xs text-sk-ink/60">
                  {brand.labels.publicApproxEndShort}{" "}
                  {format(
                    new Date(
                      2000,
                      0,
                      1,
                      ...slotTime.split(":").map(Number) as [number, number]
                    ).getTime() +
                      selectedCourse.durationMin * 60_000,
                    "HH:mm"
                  )}
                </p>
              ) : null}
            </div>
            <div className="space-y-3 text-sm">
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                aria-hidden="true"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="booking-first-name" className="sr-only">
                    {brand.labels.placeholderFirstName}
                  </label>
                  <input
                    id="booking-first-name"
                    className="w-full rounded border px-2 py-2"
                    placeholder={brand.labels.placeholderFirstName}
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="booking-last-name" className="sr-only">
                    {brand.labels.placeholderLastName}
                  </label>
                  <input
                    id="booking-last-name"
                    className="w-full rounded border px-2 py-2"
                    placeholder={brand.labels.placeholderLastName}
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="booking-email" className="sr-only">
                  {brand.labels.placeholderEmail}
                </label>
                <input
                  id="booking-email"
                  className="w-full rounded border px-2 py-2"
                  type="email"
                  placeholder={brand.labels.placeholderEmail}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className="sr-only">
                  {brand.labels.placeholderPhoneOptional}
                </label>
                <input
                  id="booking-phone"
                  className="w-full rounded border px-2 py-2"
                  placeholder={brand.labels.placeholderPhoneOptional}
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div
                className="text-xs font-medium text-sk-ink/70"
                id="booking-wizard-niveau-label"
              >
                {brand.labels.clientSkillFilterLabel}
              </div>
              <div
                className="mt-1 flex flex-wrap gap-2"
                role="radiogroup"
                aria-labelledby="booking-wizard-niveau-label"
              >
                {(
                  ["anfaenger", "fortgeschritten", "experte"] as const
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={niveau === k}
                    onClick={() => setNiveau(k)}
                    className={`rounded-full px-3 py-1 ${
                      niveau === k
                        ? "bg-sk-cta text-white"
                        : "bg-sk-surface text-sk-ink"
                    }`}
                  >
                    {niveauLabels[k]}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="booking-message" className="sr-only">
                  {brand.labels.placeholderMessageOptional}
                </label>
                <textarea
                  id="booking-message"
                  className="w-full rounded border px-2 py-2"
                  rows={3}
                  placeholder={brand.labels.placeholderMessageOptional}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {TURNSTILE_SITE ? (
                <div
                  className="mt-3 rounded border border-sk-ink/10 bg-white/80 p-3"
                  aria-label={brand.labels.publicTurnstileLabel}
                >
                  <p className="mb-2 text-xs text-sk-ink/60">
                    {brand.labels.publicTurnstileLabel}
                  </p>
                  <PublicTurnstile
                    siteKey={TURNSTILE_SITE}
                    onToken={setTurnstileToken}
                  />
                </div>
              ) : null}
              {selectedCourse && day ? (
                <div className="rounded bg-sk-surface p-3 text-xs text-sk-ink/80">
                  <div>
                    {brand.labels.serviceSingular}: {selectedCourse.name}
                  </div>
                  <div>
                    {brand.labels.publicSummaryDateLabel}: {day}{" "}
                    {slotTime ?? ""}
                  </div>
                  <div>
                    {brand.labels.publicSummaryPriceLabel}:{" "}
                    {brand.labels.invoiceTableCurrency}{" "}
                    {selectedCourse.priceCHF}
                  </div>
                  <p className="mt-2 text-sk-ink/60">
                    {brand.labels.publicNoPaymentDisclaimer}
                  </p>
                </div>
              ) : null}
            </div>
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
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-sk-outline/35 bg-white px-4 py-2 text-sm font-medium text-sk-brand shadow-sm transition hover:bg-sk-highlight"
              onClick={() => {
                setLoadErr(null);
                setErr(null);
                setStep(2);
              }}
            >
              {brand.labels.calPrevious}
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
              onClick={() => void submit()}
            >
              {brand.labels.publicWizardSubmitRequestCtaTemplate.replace(
                "{requestSingular}",
                brand.labels.requestSingular
              )}
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section
          className="sk-surface-card relative overflow-hidden p-8 text-center md:p-10"
          aria-labelledby="booking-wizard-step-4-heading"
          role="status"
          aria-live="polite"
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl"
            aria-hidden
          />
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100"
            aria-hidden
          >
            ✓
          </div>
          <h2
            id="booking-wizard-step-4-heading"
            className="mt-4 text-xl font-semibold text-sk-ink"
          >
            {brand.labels.publicThanksTitleTemplate.replace(
              "{name}",
              firstName
            )}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sk-ink/80">
            {brand.labels.publicThanksIntroTemplate.replace(
              "{request}",
              brand.labels.requestSingular
            )}{" "}
            <span className="font-medium text-sk-brand">{email}</span>.
          </p>
          {doneId && doneId !== "ok" ? (
            <p className="mt-4 inline-block rounded-lg border border-sk-ink/10 bg-white/80 px-3 py-1.5 font-mono text-xs text-sk-ink/60">
              {brand.labels.publicReferenceLabel}: {doneId}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-8 rounded-xl border-2 border-sk-cta/35 bg-white px-5 py-2.5 text-sm font-medium text-sk-cta shadow-sm transition hover:border-sk-cta hover:bg-sk-highlight/40"
            onClick={reset}
          >
            {brand.labels.publicWizardNewRequestAgainTemplate.replace(
              "{requestSingular}",
              brand.labels.requestSingular
            )}
          </button>
        </section>
      ) : null}
    </div>
  );
}
