"use client";

import { CHFAmount } from "@/components/ui/CHFAmount";
import { brand } from "@/config/brand";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BookingStatus, BookingWithDetailsDto } from "../types";

export function BookingDetailPanel({
  booking,
  onClose,
  onUpdated,
}: {
  booking: BookingWithDetailsDto;
  onClose: () => void;
  onUpdated: (patch?: BookingWithDetailsDto) => void;
}) {
  async function patchStatus(status: BookingStatus) {
    const r = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(
        (j as { error?: string }).error ?? brand.labels.uiSaveFailed
      );
      return;
    }
    const updated = (await r.json()) as BookingWithDetailsDto;
    onUpdated(updated);
  }

  async function remove() {
    if (
      !confirm(`${brand.labels.appointmentSingular} wirklich löschen?`)
    )
      return;
    const r = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(
        (j as { error?: string }).error ?? brand.labels.uiDeleteFailed
      );
      return;
    }
    onClose();
    onUpdated();
  }

  return (
    <aside className="flex flex-col border-sk-ink/10 bg-white lg:border-l lg:pl-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-sk-ink">
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
          onClick={() => patchStatus("durchgefuehrt")}
          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          {brand.labels.statusDurchgefuehrt}
        </button>
        <button
          type="button"
          onClick={() => patchStatus("storniert")}
          className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-300"
        >
          {brand.labels.bookingActionStornieren}
        </button>
        <button
          type="button"
          onClick={remove}
          className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          {brand.labels.uiDelete}
        </button>
      </div>
      <button
        type="button"
        className="mt-3 w-full rounded border border-sk-brand px-3 py-2 text-sm font-medium text-sk-brand hover:bg-[#E8F0FA]"
        onClick={async () => {
          const r = await fetch("/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: booking.id }),
          });
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            alert(
              (j as { error?: string }).error ?? brand.labels.uiErrorGeneric
            );
            return;
          }
          alert(
            `${brand.labels.invoiceSingular} erstellt — unter ${brand.labels.navInvoices} / PDF.`
          );
          onUpdated();
        }}
      >
        {brand.labels.invoiceSingular} erstellen
      </button>
    </aside>
  );
}
