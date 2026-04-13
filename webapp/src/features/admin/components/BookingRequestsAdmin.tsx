"use client";

import { useAppToast } from "@/components/app-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { brand } from "@/config/brand";
import type { StatusBadgeVariant } from "@/lib/colors";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { useEffect, useState } from "react";
import useSWR from "swr";

function requestStatusVariant(status: string): StatusBadgeVariant {
  if (status === "neu") return "anfrage_neu";
  if (status === "bestaetigt") return "anfrage_bestaetigt";
  return "anfrage_abgelehnt";
}

function f<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
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
  const { showToast } = useAppToast();
  const { data, mutate } = useSWR<ReqRow[]>("/api/admin/requests", f, {
    refreshInterval: 15_000,
    keepPreviousData: true,
  });
  const {
    data: teachers,
    error: teachersError,
    isLoading: teachersLoading,
  } = useSWR<{ id: string; name: string | null; email: string }[]>(
    "/api/teachers",
    f,
    { keepPreviousData: true }
  );
  const [pick, setPick] = useState<ReqRow | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmErr, setConfirmErr] = useState<UiErrorInfo | null>(null);
  const [rejectErr, setRejectErr] = useState<UiErrorInfo | null>(null);

  useEffect(() => {
    if (!pick || !teachers?.length) return;
    setTeacherId((prev) =>
      prev && teachers.some((t) => t.id === prev)
        ? prev
        : (teachers[0]?.id ?? "")
    );
  }, [pick, teachers]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-sk-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sk-surface text-xs text-sk-ink/60">
            <tr>
              <th className="px-3 py-2">{brand.labels.fieldStatus}</th>
              <th className="px-3 py-2">{brand.labels.clientSingular}</th>
              <th className="px-3 py-2">{brand.labels.serviceSingular}</th>
              <th className="px-3 py-2">{brand.labels.invoiceTableDate}</th>
              <th className="px-3 py-2">{brand.labels.tableColAction}</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr key={r.id} className="border-t border-sk-ink/5">
                <td className="px-3 py-2">
                  <StatusBadge variant={requestStatusVariant(r.status)} />
                </td>
                <td className="px-3 py-2">
                  {r.guestName}
                  <div className="text-xs text-sk-ink/50">{r.guestEmail}</div>
                </td>
                <td className="px-3 py-2">
                  {r.courseType?.name ?? brand.labels.uiEmDash}
                </td>
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
                          setConfirmErr(null);
                          setPick(r);
                          setTeacherId(teachers?.[0]?.id ?? "");
                        }}
                      >
                        {brand.labels.adminRequestConfirm}
                      </button>
                      <button
                        type="button"
                        className="text-red-600 underline"
                        onClick={() => setRejectId(r.id)}
                      >
                        {brand.labels.adminRequestReject}
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
            <h3 className="font-semibold text-sk-ink">
              {brand.labels.adminBookingRequestAssignStaffTitleTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              )}
            </h3>
            {teachersLoading ? (
              <p className="mt-3 text-sm text-sk-ink/60">
                {brand.labels.staffCollectiveListLoadingTemplate.replace(
                  "{staffCollectivePlural}",
                  brand.labels.staffCollectivePlural
                )}
              </p>
            ) : null}
            {teachersError ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {teachersError instanceof Error
                  ? teachersError.message
                  : brand.labels.uiErrorGeneric}
              </p>
            ) : null}
            {!teachersLoading &&
            !teachersError &&
            (!teachers || teachers.length === 0) ? (
              <p className="mt-3 text-sm text-amber-800" role="status">
                {brand.labels.adminNoTeachersForRequestConfirmHint}
              </p>
            ) : null}
            <select
              className="mt-3 w-full rounded border px-2 py-2 text-sm"
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
                setConfirmErr(null);
              }}
              disabled={
                teachersLoading || !teachers?.length || Boolean(teachersError)
              }
            >
              {!teachers?.length ? (
                <option value="">
                  {brand.labels.adminSelectStaffPlaceholder}
                </option>
              ) : null}
              {teachers?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? t.email}
                </option>
              ))}
            </select>
            {confirmErr ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {confirmErr.message}
                {confirmErr.requestId ? (
                  <span className="block text-xs text-red-700/80">
                    Ref: {confirmErr.requestId}
                  </span>
                ) : null}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded px-3 py-2 text-sm"
                onClick={() => {
                  setConfirmErr(null);
                  setPick(null);
                }}
              >
                {brand.labels.uiCancel}
              </button>
              <button
                type="button"
                disabled={
                  actionBusy ||
                  !teacherId ||
                  teachersLoading ||
                  !teachers?.length ||
                  Boolean(teachersError)
                }
                className="rounded bg-sk-brand px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={async () => {
                  if (!teacherId) return;
                  setConfirmErr(null);
                  setActionBusy(true);
                  try {
                    await fetchJson(`/api/admin/requests/${pick.id}/confirm`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ teacherId }),
                    });
                    setPick(null);
                    setConfirmErr(null);
                    showToast(
                      brand.labels.adminRequestConfirmedToastTemplate
                        .replace(
                          "{bookingRequestSingular}",
                          brand.labels.bookingRequestSingular
                        )
                        .replace("{bookingSingular}", brand.labels.bookingSingular),
                      "success"
                    );
                    void mutate();
                  } catch (e) {
                    setConfirmErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
                  } finally {
                    setActionBusy(false);
                  }
                }}
              >
                {brand.labels.adminBookingRequestConfirmCreateTemplate.replace(
                  "{bookingSingular}",
                  brand.labels.bookingSingular
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-sk-ink">
              {brand.labels.adminBookingRequestRejectTitleTemplate.replace(
                "{bookingRequestSingular}",
                brand.labels.bookingRequestSingular
              )}
            </h3>
            <textarea
              className="mt-3 w-full rounded border px-2 py-2 text-sm"
              placeholder={brand.labels.placeholderRejectReasonOptional}
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
                  setRejectErr(null);
                }}
              >
                {brand.labels.uiCancel}
              </button>
              <button
                type="button"
                disabled={actionBusy}
                className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={async () => {
                  setRejectErr(null);
                  setActionBusy(true);
                  try {
                    await fetchJson(`/api/admin/requests/${rejectId}/reject`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reason: rejectReason }),
                    });
                    setRejectId(null);
                    setRejectReason("");
                    setRejectErr(null);
                    showToast(
                      brand.labels.adminRequestRejectedToastTemplate.replace(
                        "{bookingRequestSingular}",
                        brand.labels.bookingRequestSingular
                      ),
                      "success"
                    );
                    void mutate();
                  } catch (e) {
                    setRejectErr(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
                  } finally {
                    setActionBusy(false);
                  }
                }}
              >
                {brand.labels.adminRequestReject}
              </button>
            </div>
            {rejectErr ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {rejectErr.message}
                {rejectErr.requestId ? (
                  <span className="block text-xs text-red-700/80">
                    Ref: {rejectErr.requestId}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
