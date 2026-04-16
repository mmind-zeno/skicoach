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
import { getBookingWizardUi } from "@/lib/public-ascent-ui";

const TURNSTILE_SITE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type Course = {
  id: string;
  name: string;
  durationMin: number;
  priceCHF: string;
  maxParticipants: number;
};

type Avail = Record<string, "free" | "partial" | "full" | "past">;

export function BookingWizard({ pilot }: { pilot: boolean }) {
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

  const ui = useMemo(() => getBookingWizardUi(pilot), [pilot]);
  const availColors = useMemo(
    () => ({
      free: "#EAF3DE",
      partial: "#FEF3C7",
      full: "#FEE2E2",
      past: "#E5E7EB",
      selected: ui.colSelected,
    }),
    [ui.colSelected]
  );

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
    <div className="public-safe-x mx-auto max-w-4xl px-0 py-6 sm:py-8 md:px-6 md:py-10">
      <ol
        aria-label={brand.labels.bookingWizardStepperAria}
        className="mb-6 flex list-none justify-center gap-1.5 overflow-x-auto pb-1 sm:mb-8 sm:gap-2"
      >
        {[1, 2, 3, 4].map((s) => (
          <li key={s} aria-current={s === step ? "step" : undefined}>
            <span className="sr-only">
              {brand.labels.bookingWizardStepStatusTemplate
                .replace("{current}", String(s))
                .replace("{total}", "4")}
            </span>
            <span
              className={`block h-2 w-10 shrink-0 rounded-full sm:w-16 ${
                s <= step ? ui.stepperOn : ui.stepperOff
              }`}
              aria-hidden
            />
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section
          className={ui.card}
          aria-labelledby="booking-wizard-step-1-heading"
        >
          <h2
            id="booking-wizard-step-1-heading"
            className={ui.heading}
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
                className={`min-h-[3.25rem] rounded-xl border-2 p-4 text-left transition active:scale-[0.99] ${
                  courseId === c.id ? ui.courseOn : ui.courseOff
                }`}
              >
                <div className={ui.courseName}>{c.name}</div>
                <div className={ui.courseMeta}>
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
            className={`mt-6 ${ui.btnPrimary}`}
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
          className={ui.card}
          aria-labelledby="booking-wizard-step-2-heading"
        >
          <h2
            id="booking-wizard-step-2-heading"
            className={ui.heading}
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
          <div className={ui.calToolbar}>
            <button
              type="button"
              className={ui.calNavBtn}
              aria-label={brand.labels.calMonthPrevAria}
              onClick={() => {
                const m = addMonths(month, -1);
                setMonth(m);
                void loadMonth(m);
              }}
            >
              ←
            </button>
            <span
              className={ui.calMonthTitle}
              aria-live="polite"
            >
              {format(month, "MMMM yyyy", { locale: appDateFnsLocale })}
            </span>
            <button
              type="button"
              className={ui.calNavBtn}
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
          <div className="mt-4 grid grid-cols-7 gap-0.5 text-center text-[10px] sm:gap-1 sm:text-xs">
            {weekdayShort.map((d) => (
              <div key={d} className={ui.weekday}>
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
                  className="flex min-h-[40px] min-w-0 items-center justify-center rounded-lg p-1 text-xs font-medium disabled:opacity-40 sm:min-h-[44px] sm:p-2 sm:text-sm"
                  style={{
                    backgroundColor:
                      day === key
                        ? availColors.selected
                        : a === "past"
                          ? availColors.past
                          : availColors[a],
                    color: day === key ? "#fff" : ui.calDayText,
                  }}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
          <p className={ui.legend}>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-3 w-3 rounded"
                style={{ background: availColors.free }}
              />
              {brand.labels.publicAvailFree}
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-3 w-3 rounded"
                style={{ background: availColors.partial }}
              />
              {brand.labels.publicAvailPartial}
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-3 w-3 rounded"
                style={{ background: availColors.full }}
              />
              {brand.labels.publicAvailFull}
            </span>
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={ui.btnSecondary}
              onClick={() => {
                setLoadErr(null);
                setStep(1);
              }}
            >
              {brand.labels.calPrevious}
            </button>
            <button
              type="button"
              className={ui.btnPrimary}
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
          className={ui.card}
          aria-labelledby="booking-wizard-step-3-heading"
        >
          <h2
            id="booking-wizard-step-3-heading"
            className={ui.heading}
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
              <div id="booking-wizard-slots-label" className={ui.slotsSectionLabel}>
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
                    className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium ${
                      !s.available
                        ? ui.slotDisabled
                        : slotTime === s.time
                          ? ui.slotOn
                          : ui.slotOff
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
              {selectedCourse && slotTime ? (
                <p className={ui.meta}>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
                <div>
                  <label htmlFor="booking-first-name" className="sr-only">
                    {brand.labels.placeholderFirstName}
                  </label>
                  <input
                    id="booking-first-name"
                    className={`${ui.field} w-full`}
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
                    className={`${ui.field} w-full`}
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
                  className={`${ui.field} w-full`}
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
                  className={`${ui.field} w-full`}
                  placeholder={brand.labels.placeholderPhoneOptional}
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
                           <div className={ui.labelMuted} id="booking-wizard-niveau-label">
                {brand.labels.clientSkillFilterLabel}
              </div>
              <div
                className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
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
                    className={`min-h-[48px] flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold sm:flex-none sm:rounded-full ${
                      niveau === k ? ui.niveauOn : ui.niveauOff
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
                  className={`${ui.fieldArea} w-full`}
                  rows={3}
                  placeholder={brand.labels.placeholderMessageOptional}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {TURNSTILE_SITE ? (
                <div
                  className={ui.turnstileBox}
                  aria-label={brand.labels.publicTurnstileLabel}
                >
                  <p className={ui.turnstileHint}>
                    {brand.labels.publicTurnstileLabel}
                  </p>
                  <PublicTurnstile
                    siteKey={TURNSTILE_SITE}
                    onToken={setTurnstileToken}
                  />
                </div>
              ) : null}
              {selectedCourse && day ? (
                <div className={ui.summaryBox}>
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
                  <p className={ui.summaryMuted}>
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
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={ui.btnSecondary}
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
              className={ui.btnPrimary}
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
          className={`${ui.card} relative overflow-hidden text-center`}
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
            className={ui.thanksTitle}
          >
            {brand.labels.publicThanksTitleTemplate.replace(
              "{name}",
              firstName
            )}
          </h2>
          <p className={ui.thanksBody}>
            {brand.labels.publicThanksIntroTemplate.replace(
              "{request}",
              brand.labels.requestSingular
            )}{" "}
            <span className={ui.thanksEmail}>{email}</span>.
          </p>
          {doneId && doneId !== "ok" ? (
            <p className={ui.refBox}>
              {brand.labels.publicReferenceLabel}: {doneId}
            </p>
          ) : null}
          <button
            type="button"
            className={ui.resetBtn}
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
