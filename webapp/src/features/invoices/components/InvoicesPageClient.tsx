"use client";

import { CHFAmount } from "@/components/ui/CHFAmount";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusBadgeVariant } from "@/lib/colors";
import { useMemo, useState } from "react";
import useSWR from "swr";
import type { InvoiceWithDetails } from "../types";

function invoiceStatusVariant(
  s: InvoiceWithDetails["status"]
): StatusBadgeVariant {
  if (s === "bezahlt") return "bezahlt";
  if (s === "storniert") return "storniert_rechnung";
  return "offen";
}

async function f<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function InvoicesPageClient() {
  const [detail, setDetail] = useState<InvoiceWithDetails | null>(null);
  const [status, setStatus] = useState("");
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    return p.toString();
  }, [status]);

  const { data: invoices, mutate } = useSWR<InvoiceWithDetails[]>(
    `/api/invoices?${qs}`,
    f,
    { refreshInterval: 20_000 }
  );

  const now = new Date();
  const statsUrl = `/api/invoices/stats?year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
  const { data: stats } = useSWR<{ openCHF: number; paidCHF: number }>(
    statsUrl,
    f
  );

  async function markPaid(id: string): Promise<boolean> {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "bezahlt" }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      window.alert(j.error ?? "Status konnte nicht gesetzt werden");
      return false;
    }
    void mutate();
    return true;
  }

  return (
    <div className="space-y-6">
      {!stats ? (
        <p className="text-sm text-sk-ink/60">Monatsstatistik wird geladen…</p>
      ) : null}
      {stats ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard
            label="Offen (Monat)"
            value={
              <CHFAmount amount={stats.openCHF} size="xl" className="text-amber-800" />
            }
            subType="warning"
          />
          <MetricCard
            label="Bezahlt (Monat)"
            value={
              <CHFAmount amount={stats.paidCHF} size="xl" className="text-emerald-700" />
            }
            subType="positive"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-sk-ink">
          Status
          <select
            className="ml-2 rounded border border-sk-ink/20 px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Alle</option>
            <option value="offen">Offen</option>
            <option value="bezahlt">Bezahlt</option>
            <option value="storniert">Storniert</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-sk-ink/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-sk-surface text-xs text-sk-ink/60">
            <tr>
              <th className="px-3 py-2">Nr.</th>
              <th className="px-3 py-2">Gast</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">CHF</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv) => (
              <tr key={inv.id} className="border-t border-sk-ink/5">
                <td className="px-3 py-2 font-mono text-xs">{inv.invoiceNumber}</td>
                <td className="px-3 py-2">{inv.guestName}</td>
                <td className="px-3 py-2 text-xs">{inv.bookingDate}</td>
                <td className="px-3 py-2">
                  <CHFAmount amount={inv.amountCHF} size="sm" />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge
                    variant={invoiceStatusVariant(inv.status)}
                    label={inv.status}
                  />
                </td>
                <td className="space-x-2 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="text-sk-brand underline"
                    onClick={() => setDetail(inv)}
                  >
                    Vorschau
                  </button>
                  <a
                    className="text-sk-brand underline"
                    href={`/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    PDF
                  </a>
                  {inv.status === "offen" ? (
                    <button
                      type="button"
                      className="text-emerald-700 underline"
                      onClick={() => void markPaid(inv.id)}
                    >
                      Bezahlt
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inv-detail-title"
          onClick={() => setDetail(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sk-ink/10 px-4 py-3">
              <h2 id="inv-detail-title" className="text-sm font-semibold text-sk-ink">
                Rechnung {detail.invoiceNumber}
              </h2>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm text-sk-ink/70 hover:bg-sk-surface"
                onClick={() => setDetail(null)}
              >
                Schliessen
              </button>
            </div>
            <iframe
              title={`PDF ${detail.invoiceNumber}`}
              src={`/api/invoices/${detail.id}/pdf`}
              className="min-h-[70vh] w-full flex-1 border-0 bg-sk-surface"
            />
            <div className="flex flex-wrap gap-2 border-t border-sk-ink/10 px-4 py-3">
              <a
                className="rounded bg-sk-brand px-3 py-2 text-sm text-white"
                href={`/api/invoices/${detail.id}/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                PDF herunterladen
              </a>
              {detail.status === "offen" ? (
                <button
                  type="button"
                  className="rounded border border-emerald-600 px-3 py-2 text-sm text-emerald-800"
                  onClick={async () => {
                    const ok = await markPaid(detail.id);
                    if (ok) setDetail(null);
                  }}
                >
                  Als bezahlt markieren
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
