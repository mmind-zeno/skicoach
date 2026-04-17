"use client";

import { useState } from "react";
import { brand } from "@/config/brand";

export function AccountPasswordForm({ ascent }: { ascent: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fieldClass = ascent
    ? "mt-1.5 w-full rounded-xl border-0 bg-[var(--ascent-container-low)] px-3 py-2.5 text-[var(--ascent-on-surface)] shadow-[inset_0_0_0_1px_rgba(0,88,188,0.12)] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ascent-primary)]/35"
    : "sk-field mt-1.5 w-full";

  const labelClass = ascent
    ? "block text-sm font-medium text-[var(--ascent-on-surface)]"
    : "block text-sm font-medium text-sk-ink";

  const submitClass = ascent
    ? "rounded-xl bg-gradient-to-br from-[var(--ascent-primary)] to-[var(--ascent-primary-container)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(0,88,188,0.35)] transition active:scale-[0.99] disabled:opacity-60"
    : "rounded-xl bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid active:scale-[0.99] disabled:opacity-60";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? brand.labels.uiSaveFailed);
        return;
      }
      setMessage(brand.labels.accountPasswordSuccess);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(brand.labels.uiSaveFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <label className={labelClass}>
        {brand.labels.accountPasswordCurrent}
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(ev) => setCurrentPassword(ev.target.value)}
          className={fieldClass}
          placeholder={brand.labels.accountPasswordCurrentPlaceholder}
        />
      </label>
      <label className={labelClass}>
        {brand.labels.accountPasswordNew}
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          className={fieldClass}
          placeholder={brand.labels.accountPasswordNewPlaceholder}
        />
      </label>
      <label className={labelClass}>
        {brand.labels.accountPasswordConfirm}
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(ev) => setConfirmPassword(ev.target.value)}
          className={fieldClass}
        />
      </label>
      <button type="submit" disabled={loading} className={submitClass}>
        {loading
          ? brand.labels.accountPasswordSaving
          : brand.labels.accountPasswordSave}
      </button>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
