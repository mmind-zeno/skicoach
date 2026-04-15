"use client";

import { brand } from "@/config/brand";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  courseName: string;
  teacherName: string;
  priceCHF: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
};

export function GuestPortalPageClient() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("token");
    if (t) {
      setToken(t);
      try {
        window.localStorage.setItem("guestPortalToken", t);
      } catch {
        /* ignore */
      }
      window.history.replaceState({}, "", "/buchen/meine-termine");
    } else {
      try {
        const s = window.localStorage.getItem("guestPortalToken");
        if (s) setToken(s);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const load = useCallback(async (t: string) => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/public/guest-portal/bookings", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? brand.labels.guestPortalInvalidToken
            : brand.labels.guestPortalLoadFailed
        );
      }
      const data = (await res.json()) as { bookings: Row[] };
      setRows(data.bookings);
    } catch (e) {
      setErr(e instanceof Error ? e.message : brand.labels.guestPortalLoadFailed);
      setRows(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  async function requestLink(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/public/guest-portal/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) {
        setErr(brand.labels.guestPortalRateLimited);
        return;
      }
      if (!res.ok) {
        setErr(brand.labels.apiInvalidEmail);
        return;
      }
      setMsg(brand.labels.guestPortalLinkSent);
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking(id: string) {
    if (!token) return;
    if (!confirm(`${brand.labels.guestPortalCancel}?`)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/public/guest-portal/bookings/${id}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(j?.error ?? brand.labels.guestPortalLoadFailed);
      }
      await load(token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : brand.labels.guestPortalLoadFailed);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken(null);
    setRows(null);
    try {
      window.localStorage.removeItem("guestPortalToken");
    } catch {
      /* ignore */
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-xl font-semibold text-sk-ink">
          {brand.labels.guestPortalPageTitle}
        </h1>
        <p className="mt-2 text-sm text-sk-ink/80">
          {brand.labels.guestPortalPageIntro}
        </p>
        <form onSubmit={requestLink} className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-sk-ink">
            {brand.labels.guestPortalEmailLabel}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sk-ink/20 bg-white px-3 py-2.5 text-sk-ink outline-none ring-sk-brand focus:ring-2"
              autoComplete="email"
            />
          </label>
          {err ? (
            <p className="text-sm text-red-700" role="alert">
              {err}
            </p>
          ) : null}
          {msg ? (
            <p className="text-sm text-emerald-800" role="status">
              {msg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-sk-cta px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sk-cta-mid disabled:opacity-50"
          >
            {brand.labels.guestPortalSendLink}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-sk-ink">
          {brand.labels.guestPortalPageTitle}
        </h1>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-sk-brand underline"
        >
          {brand.labels.guestPortalLogout}
        </button>
      </div>
      {err ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {err}
        </p>
      ) : null}
      {busy && !rows ? (
        <p className="mt-6 text-sm text-sk-ink/60">…</p>
      ) : null}
      {rows && rows.length === 0 ? (
        <p className="mt-6 text-sm text-sk-ink/70">{brand.labels.guestPortalEmpty}</p>
      ) : null}
      {rows && rows.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-sk-ink/10 bg-white/90 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium text-sk-ink">
                    {r.date} · {r.startTime}–{r.endTime}
                  </div>
                  <div className="text-sm text-sk-ink/80">{r.courseName}</div>
                  <div className="text-xs text-sk-ink/60">
                    {brand.labels.guestPortalColTeacher}: {r.teacherName}
                  </div>
                  <div className="mt-2">
                    <StatusBadge
                      variant={
                        r.status === "durchgefuehrt" || r.status === "storniert"
                          ? r.status
                          : "geplant"
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  {r.invoiceId ? (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-sk-brand/40 px-3 py-2 text-sm font-medium text-sk-brand"
                      onClick={() => {
                        void (async () => {
                          const res = await fetch(
                            `/api/public/guest-portal/invoices/${r.invoiceId}/pdf`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          if (!res.ok) return;
                          const blob = await res.blob();
                          const u = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = u;
                          a.download = `rechnung-${r.invoiceNumber ?? r.invoiceId}.pdf`;
                          a.click();
                          URL.revokeObjectURL(u);
                        })();
                      }}
                    >
                      {brand.labels.guestPortalInvoicePdf}
                    </button>
                  ) : null}
                  {r.status === "geplant" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void cancelBooking(r.id)}
                      className="rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 disabled:opacity-50"
                    >
                      {brand.labels.guestPortalCancel}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
