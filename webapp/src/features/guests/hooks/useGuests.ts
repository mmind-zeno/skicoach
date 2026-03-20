"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import type { GuestListItem, GuestWithBookings } from "../types";

async function fetcher<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? r.statusText);
  }
  return r.json();
}

export function useGuestList(search: string, niveau: string) {
  const key = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (niveau) p.set("niveau", niveau);
    const qs = p.toString();
    return `/api/guests${qs ? `?${qs}` : ""}`;
  }, [search, niveau]);

  const swr = useSWR<GuestListItem[]>(key, fetcher);
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
    fetcher
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
    const r = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error((j as { error?: string }).error ?? "Fehler");
    }
    return r.json();
  }, []);

  const update = useCallback(async (id: string, body: Record<string, unknown>) => {
    const r = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error((j as { error?: string }).error ?? "Fehler");
    }
    return r.json();
  }, []);

  const remove = useCallback(async (id: string) => {
    const r = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error((j as { error?: string }).error ?? "Fehler");
    }
  }, []);

  const addContact = useCallback(
    async (guestId: string, body: { kind: string; body: string }) => {
      const r = await fetch(`/api/guests/${guestId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Fehler");
      }
      return r.json();
    },
    []
  );

  return { create, update, remove, addContact };
}
