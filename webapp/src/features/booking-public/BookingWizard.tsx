"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { PublicTurnstile } from "./PublicTurnstile";
import { brand } from "@/config/brand";

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
  selected: "#1B4F8A",
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
  const [err, setErr] = useState<string | null>(null);

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

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/public/course-types");
      if (!r.ok) return;
      const data = (await r.json()) as Course[];
      setCourses(data);
      setCourseId((id) => id ?? data[0]?.id ?? null);
    })();
  }, []);

  async function loadMonth(m: Date) {
    if (!courseId) return;
    const key = format(m, "yyyy-MM");
    const r = await fetch(
      `/api/public/availability?courseTypeId=${courseId}&month=${key}`
    );
    if (!r.ok) return;
    const j = (await r.json()) as { availability: Avail };
    setAvailability(j.availability ?? {});
  }

  async function loadSlots(d: string) {
    if (!courseId) return;
    const r = await fetch(
      `/api/public/slots?courseTypeId=${courseId}&date=${d}`
    );
    if (!r.ok) return;
    const j = (await r.json()) as {
      slots: { time: string; available: boolean }[];
    };
    setSlots(j.slots ?? []);
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
      setErr(
        brand.labels.publicWizardSubmitMissingTemplate.replace(
          "{service}",
          brand.labels.serviceSingular
        )
      );
      return;
    }
    const guestName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (guestName.length < 2 || !email.includes("@")) {
      setErr(brand.labels.uiValidationNameAndEmail);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/public/requests", {
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
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(
          (j as { error?: string }).error ?? brand.labels.uiErrorGeneric
        );
        return;
      }
      setDoneId((j as { requestId?: string }).requestId ?? "ok");
      setStep(4);
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
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex justify-center gap-2 text-sm">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full ${
              s <= step ? "bg-sk-brand" : "bg-sk-ink/15"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <section>
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.publicWizardPickServiceTypeTemplate.replace(
              "{serviceType}",
              brand.labels.serviceTypeSingular
            )}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCourseId(c.id);
                }}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  courseId === c.id
                    ? "border-sk-brand bg-[#E8F0FA]"
                    : "border-transparent bg-white shadow hover:border-sk-brand/40"
                }`}
              >
                <div className="font-medium text-sk-brand">{c.name}</div>
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
            className="mt-6 rounded-lg bg-sk-brand px-4 py-2 text-white hover:bg-sk-hover disabled:opacity-50"
            disabled={!courseId}
            onClick={() => {
              setStep(2);
              void loadMonth(month);
            }}
          >
            {brand.labels.calNext}
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.publicWizardPickDate}
          </h2>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="text-sk-brand"
              onClick={() => {
                const m = addMonths(month, -1);
                setMonth(m);
                void loadMonth(m);
              }}
            >
              ←
            </button>
            <span className="font-medium capitalize">
              {format(month, "MMMM yyyy", { locale: de })}
            </span>
            <button
              type="button"
              className="text-sk-brand"
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
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!selectable}
                  onClick={() => {
                    setDay(key);
                    void loadSlots(key);
                  }}
                  className="rounded p-2 text-sm disabled:opacity-40"
                  style={{
                    backgroundColor:
                      day === key ? COL.selected : a === "past" ? COL.past : COL[a],
                    color: day === key ? "#fff" : "#1A1A2E",
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
              className="rounded border px-4 py-2"
              onClick={() => setStep(1)}
            >
              {brand.labels.calPrevious}
            </button>
            <button
              type="button"
              className="rounded bg-sk-brand px-4 py-2 text-white disabled:opacity-50"
              disabled={!day}
              onClick={() => setStep(3)}
            >
              {brand.labels.calNext}
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.publicWizardTimeAndContact}
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-sk-ink">
                {brand.labels.publicWizardSlotsTitle}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlotTime(s.time)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      !s.available
                        ? "bg-sk-ink/10 text-sk-ink/40 line-through"
                        : slotTime === s.time
                          ? "bg-sk-brand text-white"
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
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded border px-2 py-2"
                  placeholder={brand.labels.placeholderFirstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  className="rounded border px-2 py-2"
                  placeholder={brand.labels.placeholderLastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <input
                className="w-full rounded border px-2 py-2"
                type="email"
                placeholder={brand.labels.placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded border px-2 py-2"
                placeholder={brand.labels.placeholderPhoneOptional}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="text-xs font-medium text-sk-ink/70">
                {brand.labels.clientSkillFilterLabel}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(
                  ["anfaenger", "fortgeschritten", "experte"] as const
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setNiveau(k)}
                    className={`rounded-full px-3 py-1 ${
                      niveau === k
                        ? "bg-sk-brand text-white"
                        : "bg-sk-surface text-sk-ink"
                    }`}
                  >
                    {niveauLabels[k]}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded border px-2 py-2"
                rows={3}
                placeholder={brand.labels.placeholderMessageOptional}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {TURNSTILE_SITE ? (
                <div className="mt-3 rounded border border-sk-ink/10 bg-white/80 p-3">
                  <p className="mb-2 text-xs text-sk-ink/60">
                    Sicherheitsprüfung
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
          {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => setStep(2)}
            >
              {brand.labels.calPrevious}
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded bg-sk-brand px-4 py-2 text-white disabled:opacity-50"
              onClick={() => void submit()}
            >
              {brand.labels.requestSingular} senden →
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50 to-white p-8 text-center shadow-lg shadow-emerald-900/5">
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
          <h2 className="mt-4 text-xl font-semibold text-sk-ink">
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
            className="mt-8 rounded-xl border-2 border-sk-brand/30 bg-white px-5 py-2.5 text-sm font-medium text-sk-brand shadow-sm transition hover:border-sk-brand hover:bg-sk-surface"
            onClick={reset}
          >
            Neue {brand.labels.requestSingular} stellen
          </button>
        </section>
      ) : null}
    </div>
  );
}
