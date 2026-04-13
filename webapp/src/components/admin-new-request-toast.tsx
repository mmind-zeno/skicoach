"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";

export function AdminNewRequestToast() {
  const prev = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const { data } = useSWR<{ count: number }>(
    "/api/admin/requests/count",
    (url) => fetchJson<{ count: number }>(url),
    { refreshInterval: 30_000, keepPreviousData: true }
  );

  useEffect(() => {
    const c = data?.count;
    if (c === undefined) return;
    if (prev.current !== undefined && c > prev.current) {
      setOpen(true);
      const t = setTimeout(() => setOpen(false), 14_000);
      prev.current = c;
      return () => clearTimeout(t);
    }
    prev.current = c;
  }, [data?.count]);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
      role="status"
    >
      <p className="font-medium">
        {brand.labels.adminNewRequestToastTitleTemplate.replace(
          "{bookingRequest}",
          brand.labels.bookingRequestSingular
        )}
      </p>
      <p className="mt-1 text-amber-900/90">
        {brand.labels.adminNewRequestToastBodyTemplate.replace(
          "{requestSingular}",
          brand.labels.requestSingular
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/anfragen"
          className="font-medium text-sk-brand underline"
          onClick={() => setOpen(false)}
        >
          {brand.labels.adminNewRequestToastCtaTemplate.replace(
            "{requestPlural}",
            brand.labels.requestPlural
          )}
        </Link>
        <button
          type="button"
          className="text-sk-ink/60 underline"
          onClick={() => setOpen(false)}
        >
          {brand.labels.uiClose}
        </button>
      </div>
    </div>
  );
}
