"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function MountainSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 h-[45%] text-white/25"
      viewBox="0 0 400 120"
      fill="currentColor"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d="M0 120 L80 40 L140 90 L200 20 L260 100 L320 35 L400 85 L400 120 Z" />
    </svg>
  );
}

function LoginForm() {
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
        setMessage("Anmeldung fehlgeschlagen. Bitte E-Mail prüfen oder später erneut versuchen.");
      } else if (result?.ok !== false) {
        setMessage("Link wurde gesendet — bitte Postfach prüfen.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0c1f3a] via-[#1B4F8A] to-[#4a90c4] lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
              radial-gradient(circle at 70% 60%, white 1px, transparent 1px)`,
            backgroundSize: "48px 48px, 64px 64px",
          }}
        />
        <MountainSilhouette />
        <div className="relative z-[1] flex h-full flex-col justify-center px-12 text-white">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            skicoach
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight">
            Team-Bereich
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
            Kalender, Gäste, Rechnungen und Chat — sicher per Magic-Link.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-sk-surface px-5 py-10 sm:px-8 lg:bg-white lg:py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-sk-ink/10 bg-white p-8 shadow-lg lg:shadow-xl lg:ring-1 lg:ring-sk-ink/5">
          <div className="mb-6 flex justify-center lg:hidden">
            <div className="rounded-full bg-sk-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sk-brand">
              skicoach
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-sk-ink">Anmelden</h1>
          <p className="mt-2 text-sm text-sk-ink/70">
            Magic Link per E-Mail. Nach dem Klick im Postfach bist du eingeloggt.
          </p>

          <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950/90">
            <strong className="font-medium">Ohne E-Mail-Versand (Resend):</strong> ein Admin kann auf
            dem Server mit{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
              npm run admin:login-url
            </code>{" "}
            (Container) einen Einmal-Link erzeugen — siehe README.
          </div>

          {error ? (
            <p
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error === "Configuration"
                ? "Server-Konfiguration unvollständig (z. B. RESEND_API_KEY oder AUTH_SECRET)."
                : error === "AccessDenied"
                  ? "Zugang verweigert — dieses Konto ist deaktiviert."
                  : `Fehler: ${error}`}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-sk-ink">
              E-Mail
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-sk-ink/15 px-3 py-2.5 text-sk-ink outline-none transition ring-sk-brand focus:border-sk-brand focus:ring-2"
                placeholder="du@beispiel.li"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sk-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sk-hover disabled:opacity-60"
            >
              {loading ? "Senden …" : "Link senden"}
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

          <p className="mt-8 text-center text-sm text-sk-ink/60">
            <Link href="/" className="font-medium text-sk-brand underline-offset-2 hover:underline">
              Zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-sk-surface text-sk-ink/60">
          Laden …
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
