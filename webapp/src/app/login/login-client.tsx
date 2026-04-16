"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ProductPreviewCalendar } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";

/** Unsplash — Bergsee/Gipfel; getrennt vom Start-Hero. */
const LOGIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85";

function LoginHeroBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-[min(55vw,28rem)] w-[min(55vw,28rem)] rounded-full bg-white/[0.09] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-[18%] h-[min(45vw,22rem)] w-[min(45vw,22rem)] rounded-full bg-sky-200/[0.14] blur-3xl"
        aria-hidden
      />
      <svg
        className="absolute bottom-0 left-0 right-0 h-[38%] min-h-[7rem] text-white/[0.11]"
        viewBox="0 0 480 140"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 96 C80 72 120 108 200 88 S340 52 480 78 L480 140 L0 140 Z" />
      </svg>
    </>
  );
}

function LoginForm({ pilot }: { pilot: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/kalender";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await signIn("resend", {
        email: email.trim(),
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setMessage(brand.labels.loginMessageSignInFailed);
      } else if (result?.ok !== false) {
        setMessage(brand.labels.loginMessageLinkSent);
      }
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = pilot
    ? "mt-1.5 w-full rounded-xl border-0 bg-[var(--ascent-container-low)] px-3 py-2.5 text-[var(--ascent-on-surface)] shadow-[inset_0_0_0_1px_rgba(0,88,188,0.12)] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ascent-primary)]/35"
    : "sk-field mt-1.5 w-full";

  const submitClass = pilot
    ? "w-full min-h-[48px] rounded-xl bg-gradient-to-br from-[var(--ascent-primary)] to-[var(--ascent-primary-container)] px-4 py-3 text-base font-bold text-white shadow-[0_12px_28px_-8px_rgba(0,88,188,0.35)] transition active:scale-[0.99] disabled:opacity-60 sm:text-sm"
    : "w-full min-h-[48px] rounded-xl bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid active:scale-[0.99] disabled:opacity-60 sm:text-sm";

  const cardClass = pilot
    ? "mx-auto w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-[0_24px_48px_-16px_rgba(0,88,188,0.2)] ring-1 ring-[var(--ascent-primary)]/12 sm:p-8 lg:p-10"
    : "mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sk-ambient ring-1 ring-sk-outline/25 sm:p-8 lg:p-10";

  const rightBg = pilot
    ? "flex flex-col justify-center bg-[var(--ascent-surface)] px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:bg-[var(--ascent-surface)] lg:py-12"
    : "flex flex-col justify-center bg-sk-surface px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:bg-white lg:py-12";

  const h1Class = pilot
    ? "text-2xl font-bold text-[var(--ascent-on-surface)]"
    : "text-2xl font-semibold text-sk-ink";

  const leadClass = pilot
    ? "mt-2 text-sm text-[var(--ascent-on-surface-variant)]"
    : "mt-2 text-sm text-sk-ink/70";

  const labelClass = pilot
    ? "block text-sm font-medium text-[var(--ascent-on-surface)]"
    : "block text-sm font-medium text-sk-ink";

  const homeLinkClass = pilot
    ? "font-medium text-[var(--ascent-primary)] underline-offset-2 hover:underline"
    : "font-medium text-sk-brand underline-offset-2 hover:underline";

  const mobileBadgeClass = pilot
    ? "rounded-full bg-[var(--ascent-primary)]/12 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--ascent-primary)]"
    : "rounded-full bg-sk-cta/12 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sk-cta";

  return (
    <div
      className={
        pilot
          ? "app-ascent grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)]"
          : "grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)]"
      }
    >
      <div className="relative hidden min-h-screen overflow-hidden lg:block">
        {pilot ? (
          <>
            <Image
              src={LOGIN_HERO_IMAGE}
              alt=""
              fill
              className="object-cover object-[center_35%]"
              sizes="60vw"
              priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[var(--ascent-primary)]/88 via-[var(--ascent-primary)]/55 to-[var(--ascent-primary)]/35"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
                  radial-gradient(circle at 70% 60%, white 1px, transparent 1px)`,
                backgroundSize: "48px 48px, 64px 64px",
              }}
              aria-hidden
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${brand.loginHero.gradientFrom} 0%, ${brand.loginHero.gradientVia} 48%, ${brand.loginHero.gradientTo} 100%)`,
                opacity: 0.92,
              }}
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
                  radial-gradient(circle at 70% 60%, white 1px, transparent 1px)`,
                backgroundSize: "48px 48px, 64px 64px",
              }}
            />
            <LoginHeroBackdrop />
          </>
        )}
        <div className="relative z-[1] grid h-full min-h-screen grid-cols-[minmax(0,1fr)_auto] items-center gap-10 px-10 xl:px-16">
          <div className="text-white">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">
              {brand.siteName}
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight">
              {brand.labels.teamAreaTitle}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/88">
              {brand.labels.teamAreaLead}
            </p>
          </div>
          <div className="hidden max-w-[min(100%,17rem)] shrink-0 lg:block">
            <div
              className={
                pilot
                  ? "rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-2xl shadow-black/25"
                  : "rounded-2xl border border-white/35 bg-white/95 p-1.5 shadow-2xl shadow-black/20"
              }
            >
              <ProductPreviewCalendar />
            </div>
          </div>
        </div>
      </div>

      <div className={rightBg}>
        <div className={cardClass}>
          <div className="mb-6 flex justify-center lg:hidden">
            <div className={mobileBadgeClass}>{brand.siteName}</div>
          </div>
          <div className="mb-6 flex justify-center lg:hidden">
            <div className="w-full max-w-xs">
              <ProductPreviewCalendar />
            </div>
          </div>
          <h1 className={h1Class}>{brand.labels.loginTitle}</h1>
          <p className={leadClass}>{brand.labels.loginLeadMagicLink}</p>

          <p
            className={
              pilot
                ? "mt-3 rounded-xl border border-[var(--ascent-primary)]/20 bg-[var(--ascent-primary)]/8 px-3 py-2 text-xs text-[var(--ascent-on-surface-variant)]"
                : "mt-3 rounded-lg border border-sk-brand/20 bg-sk-highlight/60 px-3 py-2 text-xs text-sk-ink/80"
            }
          >
            {brand.labels.loginTestProjectBrief}
          </p>

          <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950/90">
            <strong className="font-medium">
              {brand.labels.loginDevNoticeStrong}
            </strong>{" "}
            {brand.labels.loginDevNoticeBeforeCmd}{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
              npm run admin:login-url
            </code>{" "}
            {brand.labels.loginDevNoticeAfterCmd}
          </div>

          {error ? (
            <p
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error === "Configuration"
                ? brand.labels.loginErrorConfiguration
                : error === "AccessDenied"
                  ? brand.labels.loginErrorAccessDenied
                  : brand.labels.loginErrorGenericTemplate.replace(
                      "{error}",
                      error
                    )}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className={labelClass}>
              {brand.labels.labelEmail}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className={fieldClass}
                placeholder={brand.labels.loginEmailPlaceholder}
              />
            </label>
            <button type="submit" disabled={loading} className={submitClass}>
              {loading
                ? brand.labels.loginButtonSending
                : brand.labels.loginButtonSendLink}
            </button>
          </form>

          {message ? (
            <p
              className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              role="status"
            >
              {message}
            </p>
          ) : null}

          <p
            className={
              pilot
                ? "mt-8 text-center text-sm text-[var(--ascent-on-surface-variant)]"
                : "mt-8 text-center text-sm text-sk-ink/60"
            }
          >
            <Link href="/" className={homeLinkClass}>
              Zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginClient({ pilot }: { pilot: boolean }) {
  return (
    <Suspense
      fallback={
        <div
          className={
            pilot
              ? "app-ascent flex min-h-screen items-center justify-center bg-[var(--ascent-surface)] text-[var(--ascent-on-surface-variant)]"
              : "flex min-h-screen items-center justify-center bg-sk-surface text-sk-ink/60"
          }
        >
          {brand.labels.loginFallbackLoading}
        </div>
      }
    >
      <LoginForm pilot={pilot} />
    </Suspense>
  );
}
