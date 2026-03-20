"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusBadgeVariant } from "@/lib/colors";
import { useState } from "react";
import useSWR from "swr";

function requestStatusVariant(status: string): StatusBadgeVariant {
  if (status === "neu") return "anfrage_neu";
  if (status === "bestaetigt") return "anfrage_bestaetigt";
  return "anfrage_abgelehnt";
}

async function f<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

type ReqRow = {
  id: string;
  status: string;
  guestName: string;
  guestEmail: string;
  date: string;
  startTime: string;
  guestNiveau: string;
  message: string | null;
  courseType: { name: string } | null;
};

export function BookingRequestsAdmin() {
  const { data, mutate } = useSWR<ReqRow[]>("/api/admin/requests", f, {
    refreshInterval: 15_000,
  });
  const { data: teachers } = useSWR<{ id: string; name: string | null; email: string }[]>(
    "/api/teachers",
    f
  );
  const [pick, setPick] = useState<ReqRow | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-sk-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sk-surface text-xs text-sk-ink/60">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Gast</th>
              <th className="px-3 py-2">Kurs</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr key={r.id} className="border-t border-sk-ink/5">
                <td className="px-3 py-2">
                  <StatusBadge
                    variant={requestStatusVariant(r.status)}
                    label={r.status}
                  />
                </td>
                <td className="px-3 py-2">
                  {r.guestName}
                  <div className="text-xs text-sk-ink/50">{r.guestEmail}</div>
                </td>
                <td className="px-3 py-2">{r.courseType?.name ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {String(r.date).slice(0, 10)} {r.startTime.slice(0, 5)}
                </td>
                <td className="px-3 py-2 space-x-2">
                  {r.status === "neu" ? (
                    <>
                      <button
                        type="button"
                        className="text-sk-brand underline"
                        onClick={() => {
                          setPick(r);
                          setTeacherId(teachers?.[0]?.id ?? "");
                        }}
                      >
                        Bestätigen
                      </button>
                      <button
                        type="button"
                        className="text-red-600 underline"
                        onClick={() => setRejectId(r.id)}
                      >
                        Ablehnen
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pick ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-sk-ink">Lehrer zuweisen</h3>
            <select
              className="mt-3 w-full rounded border px-2 py-2 text-sm"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              {teachers?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? t.email}
                </option>
              ))}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded px-3 py-2 text-sm"
                onClick={() => setPick(null)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="rounded bg-sk-brand px-3 py-2 text-sm text-white"
                onClick={async () => {
                  await fetch(`/api/admin/requests/${pick.id}/confirm`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ teacherId }),
                  });
                  setPick(null);
                  void mutate();
                }}
              >
                Buchung anlegen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-sk-ink">Anfrage ablehnen</h3>
            <textarea
              className="mt-3 w-full rounded border px-2 py-2 text-sm"
              placeholder="Grund (optional)"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded px-3 py-2 text-sm"
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                onClick={async () => {
                  await fetch(`/api/admin/requests/${rejectId}/reject`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason: rejectReason }),
                  });
                  setRejectId(null);
                  setRejectReason("");
                  void mutate();
                }}
              >
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
