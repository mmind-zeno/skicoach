"use client";

import { useAppToast } from "@/components/app-toast";
import { useState } from "react";
import { CHFAmount } from "@/components/ui/CHFAmount";
import { brand } from "@/config/brand";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import type {
  BookingPaymentStatus,
  BookingStatus,
  BookingWithDetailsDto,
} from "../types";

const invoicesEnabled = !["false", "0", "off", "no"].includes(
  (process.env.NEXT_PUBLIC_FEATURE_INVOICES ?? "").trim().toLowerCase()
);

const paymentsEnabled = ["true", "1", "yes", "on"].includes(
  (process.env.NEXT_PUBLIC_FEATURE_PAYMENTS ?? "").trim().toLowerCase()
);

function paymentLabel(status: BookingPaymentStatus): string {
  switch (status) {
    case "deposit":
      return brand.labels.bookingPaymentLabelDeposit;
    case "paid":
      return brand.labels.bookingPaymentLabelPaid;
    case "refunded":
      return brand.labels.bookingPaymentLabelRefunded;
    default:
      return brand.labels.bookingPaymentLabelNone;
  }
}

export function BookingDetailPanel({
  booking,
  isAdmin,
  onClose,
  onUpdated,
}: {
  booking: BookingWithDetailsDto;
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: (patch?: BookingWithDetailsDto) => void;
}) {
  const { showToast } = useAppToast();
  const [banner, setBanner] = useState<UiErrorInfo | null>(null);
  const [pending, setPending] = useState(false);

  async function patchStatus(status: BookingStatus) {
    setBanner(null);
    setPending(true);
    try {
      const updated = await fetchJson<BookingWithDetailsDto>(
        `/api/bookings/${booking.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      onUpdated(updated);
    } catch (e) {
      setBanner(getUiErrorInfo(e, brand.labels.uiSaveFailed));
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (
      !confirm(
        brand.labels.bookingConfirmDeleteTemplate.replace(
          "{appointment}",
          brand.labels.appointmentSingular
        )
      )
    )
      return;
    setBanner(null);
    setPending(true);
    try {
      await fetchJson(`/api/bookings/${booking.id}`, { method: "DELETE" });
      onClose();
      onUpdated();
    } catch (e) {
      setBanner(getUiErrorInfo(e, brand.labels.uiDeleteFailed));
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="flex flex-col bg-transparent lg:rounded-2xl lg:bg-white lg:p-5 lg:shadow-sk-ambient">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-sk-ink">
          {brand.labels.appointmentSingular}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-sm text-sk-ink/70 hover:bg-sk-surface"
        >
          {brand.labels.uiClose}
        </button>
      </div>

      {banner ? (
        <p className="mb-3 text-sm text-red-700" role="alert">
          {banner.message}
          {banner.requestId ? (
            <span className="block text-xs text-red-800/80">
              Ref: {banner.requestId}
            </span>
          ) : null}
        </p>
      ) : null}

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-sk-ink/50">{brand.labels.clientSingular}</dt>
          <dd className="font-medium text-sk-ink">{booking.guest.name}</dd>
        </div>
        <div>
          <dt className="text-sk-ink/50">{brand.labels.staffSingular}</dt>
          <dd className="text-sk-ink">
            {booking.teacher.name ?? booking.teacher.email}
          </dd>
        </div>
        <div>
          <dt className="text-sk-ink/50">{brand.labels.serviceSingular}</dt>
          <dd className="text-sk-ink">{booking.courseType.name}</dd>
        </div>
        <div>
          <dt className="text-sk-ink/50">{brand.labels.calTime}</dt>
          <dd className="text-sk-ink">
            {booking.date} · {booking.startTime.slice(0, 5)}–
            {booking.endTime.slice(0, 5)}
          </dd>
        </div>
        <div>
          <dt className="text-sk-ink/50">{brand.labels.fieldPrice}</dt>
          <dd className="text-sk-ink">
            <CHFAmount amount={booking.priceCHF} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-sk-ink/50">{brand.labels.fieldStatus}</dt>
          <dd>
            <StatusBadge variant={booking.status} />
          </dd>
        </div>
        {booking.source === "anfrage" ? (
          <div>
            <dt className="text-sk-ink/50">{brand.labels.fieldSource}</dt>
            <dd className="text-xs text-sk-ink/80">
              {brand.labels.sourceFromBookingPortal}
            </dd>
          </div>
        ) : null}
        {booking.notes ? (
          <div>
            <dt className="text-sk-ink/50">{brand.labels.fieldNotes}</dt>
            <dd className="whitespace-pre-wrap text-sk-ink">{booking.notes}</dd>
          </div>
        ) : null}
        {paymentsEnabled ? (
          <>
            <div>
              <dt className="text-sk-ink/50">{brand.labels.fieldPaymentStatus}</dt>
              <dd className="text-sk-ink">
                {isAdmin ? (
                  <select
                    className="mt-0.5 w-full rounded border border-sk-ink/20 bg-white px-2 py-1 text-sm"
                    value={booking.paymentStatus}
                    disabled={pending}
                    onChange={(ev) => {
                      const paymentStatus = ev.target.value as BookingPaymentStatus;
                      setBanner(null);
                      setPending(true);
                      void (async () => {
                        try {
                          const updated = await fetchJson<BookingWithDetailsDto>(
                            `/api/bookings/${booking.id}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ paymentStatus }),
                            }
                          );
                          onUpdated(updated);
                        } catch (e) {
                          setBanner(getUiErrorInfo(e, brand.labels.uiSaveFailed));
                        } finally {
                          setPending(false);
                        }
                      })();
                    }}
                  >
                    <option value="none">{brand.labels.bookingPaymentLabelNone}</option>
                    <option value="deposit">
                      {brand.labels.bookingPaymentLabelDeposit}
                    </option>
                    <option value="paid">{brand.labels.bookingPaymentLabelPaid}</option>
                    <option value="refunded">
                      {brand.labels.bookingPaymentLabelRefunded}
                    </option>
                  </select>
                ) : (
                  paymentLabel(booking.paymentStatus)
                )}
              </dd>
            </div>
            {booking.paymentExternalRef ? (
              <div>
                <dt className="text-sk-ink/50">
                  {brand.labels.fieldPaymentExternalRef}
                </dt>
                <dd className="font-mono text-xs text-sk-ink">
                  {booking.paymentExternalRef}
                </dd>
              </div>
            ) : null}
          </>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-sk-ink/10 pt-4">
        <button
          type="button"
          onClick={() => patchStatus("geplant")}
          className="rounded bg-sk-surface px-2 py-1 text-xs font-medium text-sk-ink hover:bg-sk-ink/10"
        >
          {brand.labels.statusGeplant}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void patchStatus("durchgefuehrt")}
          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {brand.labels.statusDurchgefuehrt}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void patchStatus("storniert")}
          className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50"
        >
          {brand.labels.bookingActionStornieren}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void remove()}
          className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {brand.labels.uiDelete}
        </button>
      </div>
      {invoicesEnabled ? (
        <button
          type="button"
          disabled={pending}
          className="mt-3 w-full rounded border border-sk-brand/50 px-3 py-2 text-sm font-medium text-sk-brand hover:bg-sk-highlight disabled:opacity-50"
          onClick={async () => {
            setBanner(null);
            setPending(true);
            try {
              await fetchJson("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: booking.id }),
              });
              showToast(
                brand.labels.invoiceCreatedAlertTemplate
                  .replace("{invoice}", brand.labels.invoiceSingular)
                  .replace("{navInvoices}", brand.labels.navInvoices),
                "success"
              );
              onUpdated();
            } catch (e) {
              setBanner(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
            } finally {
              setPending(false);
            }
          }}
        >
          {brand.labels.invoiceCreateButtonTemplate.replace(
            "{invoice}",
            brand.labels.invoiceSingular
          )}
        </button>
      ) : null}
    </aside>
  );
}
