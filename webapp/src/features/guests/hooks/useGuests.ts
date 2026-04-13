"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorMessage } from "@/lib/client-error-message";
import type { GuestListItem, GuestWithBookings } from "../types";

function fetcher<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

export function useGuestList(search: string, niveau: string) {
  const key = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (niveau) p.set("niveau", niveau);
    const qs = p.toString();
    return `/api/guests${qs ? `?${qs}` : ""}`;
  }, [search, niveau]);

  const swr = useSWR<GuestListItem[]>(key, fetcher, {
    keepPreviousData: true,
  });
  return {
    guests: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  };
}

export function useGuestDetail(id: string | null) {
  const swr = useSWR<GuestWithBookings>(
    id ? `/api/guests/${id}` : null,
    fetcher,
    { keepPreviousData: true }
  );
  return {
    guest: swr.data,
    isLoading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  };
}

export function useGuestMutations() {
  const create = useCallback(async (body: Record<string, unknown>) => {
    try {
      return await fetchJson<unknown>("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error(getUiErrorMessage(e, brand.labels.uiErrorGeneric));
    }
  }, []);

  const update = useCallback(async (id: string, body: Record<string, unknown>) => {
    try {
      return await fetchJson<unknown>(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error(getUiErrorMessage(e, brand.labels.uiErrorGeneric));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await fetchJson<unknown>(`/api/guests/${id}`, { method: "DELETE" });
    } catch (e) {
      throw new Error(getUiErrorMessage(e, brand.labels.uiErrorGeneric));
    }
  }, []);

  const addContact = useCallback(
    async (guestId: string, body: { kind: string; body: string }) => {
      try {
        return await fetchJson<unknown>(`/api/guests/${guestId}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (e) {
        throw new Error(getUiErrorMessage(e, brand.labels.uiErrorGeneric));
      }
    },
    []
  );

  return { create, update, remove, addContact };
}
