"use client";

import { useAppToast } from "@/components/app-toast";
import { CHFAmount } from "@/components/ui/CHFAmount";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusBadgeVariant } from "@/lib/colors";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import type { InvoiceWithDetails } from "../types";

function invoiceStatusVariant(
  s: InvoiceWithDetails["status"]
): StatusBadgeVariant {
  if (s === "bezahlt") return "bezahlt";
  if (s === "storniert") return "storniert_rechnung";
  return "offen";
}

function f<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

export function InvoicesPageClient() {
  const { showToast } = useAppToast();
  const [detail, setDetail] = useState<InvoiceWithDetails | null>(null);
  const [status, setStatus] = useState("");
  const [actionErr, setActionErr] = useState<UiErrorInfo | null>(null);
  const [pendingPaidId, setPendingPaidId] = useState<string | null>(null);
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    return p.toString();
  }, [status]);

  const {
    data: invoices,
    mutate,
    error: invoicesError,
  } = useSWR<InvoiceWithDetails[]>(`/api/invoices?${qs}`, f, {
    refreshInterval: 20_000,
    keepPreviousData: true,
  });

  const now = new Date();
  const statsUrl = `/api/invoices/stats?year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
  const {
    data: stats,
    error: statsError,
    mutate: mutateStats,
  } = useSWR<{ openCHF: number; paidCHF: number }>(statsUrl, f, {
    keepPreviousData: true,
  });

  async function markPaid(id: string): Promise<boolean> {
    if (pendingPaidId === id) return false;
    setActionErr(null);
    setPendingPaidId(id);
    try {
      await fetchJson(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "bezahlt" }),
      });
      showToast(
        brand.labels.invoiceMarkedPaidToastTemplate.replace(
          "{invoice}",
          brand.labels.invoiceSingular
        ),
        "success"
      );
      void mutate();
      return true;
    } catch (e) {
      setActionErr(getUiErrorInfo(e, brand.labels.uiStatusUpdateFailed));
      return false;
    } finally {
      setPendingPaidId(null);
    }
  }

  return (
    <div className="space-y-6">
      {statsError ? (
        <div className="flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <span className="min-w-0 flex-1">{statsError.message}</span>
          <button
            type="button"
            className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium hover:bg-amber-100"
            onClick={() => void mutateStats()}
          >
            {brand.labels.uiRefresh}
          </button>
        </div>
      ) : null}
      {!stats && !statsError ? (
        <p className="text-sm text-sk-ink/60">
          {brand.labels.invoiceStatsLoading}
        </p>
      ) : null}
      {stats ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard
            label={brand.labels.invoiceMetricOpenMonth}
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
        <label className="text-sm font-medium text-sk-ink">
          {brand.labels.fieldStatus}
          <select
            className="sk-field ml-2 inline-block min-w-[8rem]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{brand.labels.uiFilterAll}</option>
            <option value="offen">{brand.labels.statusOffen}</option>
            <option value="bezahlt">{brand.labels.statusBezahlt}</option>
            <option value="storniert">{brand.labels.statusStorniert}</option>
          </select>
        </label>
      </div>

      {invoicesError ? (
        <div className="flex flex-wrap items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <span className="min-w-0 flex-1">{invoicesError.message}</span>
          <button
            type="button"
            className="shrink-0 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-100"
            onClick={() => void mutate()}
          >
            {brand.labels.uiRefresh}
          </button>
        </div>
      ) : null}
      {actionErr ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          <div>{actionErr.message}</div>
          {actionErr.requestId ? (
            <div className="mt-1 text-xs text-red-900/80">Ref: {actionErr.requestId}</div>
          ) : null}
        </div>
      ) : null}

      <div className="sk-surface-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-sk-container-low text-[11px] font-semibold uppercase tracking-wider text-sk-ink/55">
            <tr>
              <th className="px-4 py-3">
                {brand.labels.invoiceTableNumberAbbrev}
              </th>
              <th className="px-4 py-3">{brand.labels.clientSingular}</th>
              <th className="px-4 py-3">{brand.labels.invoiceTableDate}</th>
              <th className="px-4 py-3">{brand.labels.invoiceTableCurrency}</th>
              <th className="px-4 py-3">{brand.labels.fieldStatus}</th>
              <th className="px-4 py-3">{brand.labels.invoiceTableActions}</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv, i) => (
              <tr
                key={inv.id}
                className={`transition-colors hover:bg-sk-container-low/60 ${
                  i % 2 === 0 ? "bg-white" : "bg-sk-surface/80"
                }`}
              >
                <td className="px-4 py-2.5 font-mono text-xs">{inv.invoiceNumber}</td>
                <td className="px-4 py-2.5">{inv.guestName}</td>
                <td className="px-4 py-2.5 text-xs">{inv.bookingDate}</td>
                <td className="px-4 py-2.5">
                  <CHFAmount amount={inv.amountCHF} size="sm" />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge variant={invoiceStatusVariant(inv.status)} />
                </td>
                <td className="space-x-2 px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="text-sk-brand underline"
                    onClick={() => setDetail(inv)}
                  >
                    {brand.labels.invoicePreview}
                  </button>
                  <a
                    className="text-sk-brand underline"
                    href={`/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {brand.labels.invoicePdfLink}
                  </a>
                  {inv.status === "offen" ? (
                    <button
                      type="button"
                      disabled={pendingPaidId === inv.id}
                      className="text-emerald-700 underline disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void markPaid(inv.id)}
                    >
                      {brand.labels.statusBezahlt}
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
                {brand.labels.invoiceSingular} {detail.invoiceNumber}
              </h2>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm text-sk-ink/70 hover:bg-sk-surface"
                onClick={() => setDetail(null)}
              >
                {brand.labels.uiClose}
              </button>
            </div>
            <iframe
              title={`PDF ${detail.invoiceNumber}`}
              src={`/api/invoices/${detail.id}/pdf`}
              className="min-h-[70vh] w-full flex-1 border-0 bg-sk-surface"
            />
            <div className="flex flex-wrap gap-2 border-t border-sk-ink/10 px-4 py-3">
              <a
                className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-sm text-white shadow-sm hover:from-sk-cta-hover hover:to-sk-cta-mid"
                href={`/api/invoices/${detail.id}/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                {brand.labels.invoiceDownloadPdf}
              </a>
              {detail.status === "offen" ? (
                <button
                  type="button"
                  disabled={pendingPaidId === detail.id}
                  className="rounded border border-emerald-600 px-3 py-2 text-sm text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={async () => {
                    const ok = await markPaid(detail.id);
                    if (ok) setDetail(null);
                  }}
                >
                  {brand.labels.invoiceMarkPaidButton}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
