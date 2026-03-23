"use client";

import { brand } from "@/config/brand";
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
  const r = await fetch(url, { credentials: "same-origin" });
  if (r.ok) return r.json() as Promise<Row[]>;
  let detail = "";
  try {
    const j = (await r.json()) as { error?: string };
    detail = j.error ?? "";
  } catch {
    detail = (await r.text()).slice(0, 200);
  }
  if (r.status === 401) {
    throw new Error(brand.labels.auditLogUnauthorized);
  }
  if (r.status === 403) {
    throw new Error(
      brand.labels.auditLogForbiddenTemplate.replace(
        "{navAuditLog}",
        brand.labels.navAuditLog
      )
    );
  }
  throw new Error(
    detail ||
      (r.status === 500
        ? brand.labels.auditLogServerError
        : brand.labels.auditLogHttpErrorTemplate.replace(
            "{status}",
            String(r.status)
          ))
  );
}

export function AdminAuditLogClient() {
  const { data, error, isLoading } = useSWR("/api/admin/audit-logs?limit=120", fetchLogs, {
    refreshInterval: 60_000,
  });

  if (isLoading) {
    return (
      <p className="text-sm text-sk-ink/60">{brand.labels.uiLoadingEllipsis}</p>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-red-600">
        {brand.labels.auditLogLoadFailedPrefix} {error.message}
      </p>
    );
  }
  if (!data?.length) {
    return <p className="text-sm text-sk-ink/60">Noch keine Einträge.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-sk-ink/10 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="border-b border-sk-ink/10 bg-sk-surface text-sk-ink/70">
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
          {data.map((row) => (
            <tr key={row.id} className="border-b border-sk-ink/5 last:border-0">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-sk-ink/80">
                {row.createdAt.replace("T", " ").slice(0, 19)}
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
