"use client";

import { brand } from "@/config/brand";
import { FetchJsonError, fetchJson } from "@/lib/client-fetch";
import useSWR from "swr";

type Row = {
  id: string;
  action: string;
  resource: string | null;
  metadata: Record<string, unknown> | null;
  clientIp: string | null;
  createdAt: string;
  actorEmail: string | null;
};

async function fetchLogs(url: string): Promise<Row[]> {
  try {
    const rows = await fetchJson<unknown>(url);
    if (!Array.isArray(rows)) {
      throw new Error(brand.labels.auditLogServerError);
    }
    return rows as Row[];
  } catch (e) {
    const status = e instanceof FetchJsonError ? e.status : NaN;
    if (status === 401) {
      throw new Error(brand.labels.auditLogUnauthorized);
    }
    if (status === 403) {
      throw new Error(
        brand.labels.auditLogForbiddenTemplate.replace(
          "{navAuditLog}",
          brand.labels.navAuditLog
        )
      );
    }
    throw e instanceof Error ? e : new Error(brand.labels.auditLogServerError);
  }
}

export function AdminAuditLogClient() {
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    "/api/admin/audit-logs?limit=120",
    fetchLogs,
    { refreshInterval: 60_000 }
  );

  if (isLoading) {
    return (
      <p className="text-sm text-sk-ink/60">{brand.labels.uiLoadingEllipsis}</p>
    );
  }
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">
          {brand.labels.auditLogLoadFailedPrefix} {error.message}
        </p>
        <button
          type="button"
          className="rounded border border-sk-ink/20 bg-white px-3 py-1.5 text-sm text-sk-brand hover:bg-sk-surface disabled:opacity-50"
          disabled={isValidating}
          onClick={() => void mutate()}
        >
          {isValidating
            ? brand.labels.uiLoadingEllipsis
            : brand.labels.uiRefresh}
        </button>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-sk-ink/60">{brand.labels.uiNoEntriesYet}</p>
        <button
          type="button"
          className="rounded border border-sk-ink/20 bg-white px-3 py-1.5 text-sm text-sk-brand hover:bg-sk-surface disabled:opacity-50"
          disabled={isValidating}
          onClick={() => void mutate()}
        >
          {isValidating
            ? brand.labels.uiLoadingEllipsis
            : brand.labels.uiRefresh}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded border border-sk-ink/20 bg-white px-3 py-1.5 text-sm text-sk-brand hover:bg-sk-surface disabled:opacity-50"
          disabled={isValidating}
          onClick={() => void mutate()}
        >
          {isValidating
            ? brand.labels.uiLoadingEllipsis
            : brand.labels.uiRefresh}
        </button>
      </div>
    <div className="sk-surface-card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="bg-sk-container-low text-sk-ink/65">
          <tr>
            <th className="px-3 py-2 font-medium">
              {brand.labels.auditColTimeUtc}
            </th>
            <th className="px-3 py-2 font-medium">
              {brand.labels.auditColAction}
            </th>
            <th className="px-3 py-2 font-medium">
              {brand.labels.auditColActor}
            </th>
            <th className="px-3 py-2 font-medium">
              {brand.labels.auditColResource}
            </th>
            <th className="px-3 py-2 font-medium">{brand.labels.auditColIp}</th>
            <th className="px-3 py-2 font-medium">
              {brand.labels.auditColDetails}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              className={`transition-colors hover:bg-sk-container-low/50 ${
                i % 2 === 0 ? "bg-white" : "bg-sk-surface/80"
              }`}
            >
              <td className="whitespace-nowrap px-3 py-2 font-mono text-sk-ink/80">
                {formatAuditTime(row.createdAt)}
              </td>
              <td className="px-3 py-2 text-sk-brand">{row.action}</td>
              <td className="max-w-[140px] truncate px-3 py-2 text-sk-ink/80">
                {row.actorEmail ?? brand.labels.uiEmDash}
              </td>
              <td className="max-w-[120px] truncate px-3 py-2 font-mono text-sk-ink/70">
                {row.resource ?? brand.labels.uiEmDash}
              </td>
              <td className="px-3 py-2 font-mono text-sk-ink/60">{row.clientIp ?? "—"}</td>
              <td className="max-w-[220px] truncate px-3 py-2 text-sk-ink/60" title={metaTitle(row.metadata)}>
                {row.metadata
                  ? JSON.stringify(row.metadata)
                  : brand.labels.uiEmDash}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

function metaTitle(m: Record<string, unknown> | null): string {
  if (!m) return "";
  try {
    return JSON.stringify(m, null, 2);
  } catch {
    return "";
  }
}

function formatAuditTime(createdAt: string | undefined): string {
  if (!createdAt || typeof createdAt !== "string") {
    return brand.labels.uiEmDash;
  }
  return createdAt.replace("T", " ").slice(0, 19);
}
