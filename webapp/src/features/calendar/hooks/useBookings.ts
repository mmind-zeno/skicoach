"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { fetchJson } from "@/lib/client-fetch";
import { formatLocalDateISO } from "@/lib/datetime";
import type { BookingWithDetailsDto } from "../types";

function fetcher(url: string): Promise<BookingWithDetailsDto[]> {
  return fetchJson<BookingWithDetailsDto[]>(url);
}

export function useBookings(
  range: { start: Date; end: Date } | null,
  opts: {
    isAdmin: boolean;
    showAll: boolean;
    teacherId: string | null;
  }
) {
  const key = useMemo(() => {
    if (!range) return null;
    const from = formatLocalDateISO(range.start);
    const to = formatLocalDateISO(range.end);
    if (opts.isAdmin && opts.showAll) {
      return `/api/bookings?dateFrom=${from}&dateTo=${to}&all=1`;
    }
    if (!opts.teacherId) return null;
    return `/api/bookings?dateFrom=${from}&dateTo=${to}&teacherId=${opts.teacherId}`;
  }, [range, opts.isAdmin, opts.showAll, opts.teacherId]);

  const swr = useSWR<BookingWithDetailsDto[]>(key, fetcher, {
    keepPreviousData: true,
  });

  return {
    bookings: swr.data ?? [],
    error: swr.error as Error | undefined,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
}
