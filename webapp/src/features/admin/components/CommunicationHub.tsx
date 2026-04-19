"use client";

import { useAppToast } from "@/components/app-toast";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo } from "@/lib/client-error-message";
import { wrapNewsletterHtml } from "@/lib/mail/newsletter-layout";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

type ReminderMedium = "email" | "sms" | "both";

type NewsletterCampaignRow = {
  id: string;
  subject: string;
  htmlBody: string;
  status: string;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  createdAt: string;
};

type SettingsPayload = {
  reminderHoursBefore: number;
  reminderWindowHours: number;
  reminderPollIntervalMs: number;
  remindersEnabled: boolean;
  reminderMedium: ReminderMedium;
  reminderSmsWebhookUrl: string;
  hasDbOverrides: boolean;
  newsletterRecipientCount: number;
};

function fetcher<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

export function CommunicationHub() {
  const { showToast } = useAppToast();
  const [tab, setTab] = useState<"reminders" | "newsletter">("reminders");

  const { data: settings, mutate: mutSettings } = useSWR<SettingsPayload>(
    "/api/admin/communication-settings",
    fetcher
  );

  const { data: campaigns, mutate: mutCampaigns } = useSWR<NewsletterCampaignRow[]>(
    "/api/admin/newsletter/campaigns",
    fetcher
  );

  const [hoursBefore, setHoursBefore] = useState("");
  const [windowH, setWindowH] = useState("");
  const [pollMs, setPollMs] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [medium, setMedium] = useState<ReminderMedium>("email");
  const [webhook, setWebhook] = useState("");
  const [savingRem, setSavingRem] = useState(false);

  const syncRemindersFromPayload = useCallback((s: SettingsPayload) => {
    setHoursBefore(String(s.reminderHoursBefore));
    setWindowH(String(s.reminderWindowHours));
    setPollMs(String(s.reminderPollIntervalMs));
    setEnabled(s.remindersEnabled);
    setMedium(s.reminderMedium);
    setWebhook(s.reminderSmsWebhookUrl);
  }, []);

  const remindersFormInit = useRef(false);
  useEffect(() => {
    if (settings && !remindersFormInit.current) {
      syncRemindersFromPayload(settings);
      remindersFormInit.current = true;
    }
  }, [settings, syncRemindersFromPayload]);

  const [subj, setSubj] = useState("");
  const [html, setHtml] = useState(
    "<h2>Willkommen!</h2>\n<p>Hier deine <strong>News</strong> — <a href=\"#\">Link</a></p>"
  );
  const [busyNews, setBusyNews] = useState(false);

  async function saveReminders() {
    if (!settings) return;
    setSavingRem(true);
    try {
      const hb = Number.parseFloat(hoursBefore);
      const wh = Number.parseFloat(windowH);
      const pm = Number.parseInt(pollMs, 10);
      await fetchJson<SettingsPayload>("/api/admin/communication-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderHoursBefore: hb,
          reminderWindowHours: wh,
          reminderPollIntervalMs: pm,
          remindersEnabled: enabled,
          reminderMedium: medium,
          reminderSmsWebhookUrl: webhook.trim() || null,
        }),
      });
      await mutSettings();
      showToast(brand.labels.commsSavedToast, "success");
    } catch (e) {
      showToast(getUiErrorInfo(e, brand.labels.uiErrorGeneric).message, "error");
    } finally {
      setSavingRem(false);
    }
  }

  async function resetReminders() {
    if (!confirm(brand.labels.commsResetEnvDefaults)) return;
    setSavingRem(true);
    try {
      const s = await fetchJson<SettingsPayload>("/api/admin/communication-settings", {
        method: "DELETE",
      });
      syncRemindersFromPayload(s);
      await mutSettings();
      showToast(brand.labels.commsSavedToast, "success");
    } catch (e) {
      showToast(getUiErrorInfo(e, brand.labels.uiErrorGeneric).message, "error");
    } finally {
      setSavingRem(false);
    }
  }

  async function createDraft() {
    if (!subj.trim()) {
      showToast(brand.labels.newsletterEmptySubject, "error");
      return;
    }
    if (!html.trim()) {
      showToast(brand.labels.newsletterEmptyBody, "error");
      return;
    }
    setBusyNews(true);
    try {
      await fetchJson("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subj.trim(), htmlBody: html }),
      });
      await mutCampaigns();
      showToast(brand.labels.commsSavedToast, "success");
    } catch (e) {
      showToast(getUiErrorInfo(e, brand.labels.uiErrorGeneric).message, "error");
    } finally {
      setBusyNews(false);
    }
  }

  async function sendCampaign(id: string) {
    if (!confirm(brand.labels.newsletterSendConfirm)) return;
    setBusyNews(true);
    try {
      await fetchJson(`/api/admin/newsletter/campaigns/${id}/send`, {
        method: "POST",
      });
      await mutCampaigns();
      await mutSettings();
      showToast(brand.labels.newsletterSentToast, "success");
    } catch (e) {
      showToast(getUiErrorInfo(e, brand.labels.uiErrorGeneric).message, "error");
    } finally {
      setBusyNews(false);
    }
  }

  const previewName = "Alex Beispiel";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("reminders")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "reminders"
              ? "bg-sk-brand text-white shadow-md"
              : "bg-sk-container-high text-sk-ink hover:bg-sk-highlight/60"
          }`}
        >
          {brand.labels.commsTabReminders}
        </button>
        <button
          type="button"
          onClick={() => setTab("newsletter")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "newsletter"
              ? "bg-gradient-to-r from-[#1B4F8A] to-[#4A7EC7] text-white shadow-md"
              : "bg-sk-container-high text-sk-ink hover:bg-sk-highlight/60"
          }`}
        >
          {brand.labels.commsTabNewsletter}
        </button>
      </div>

      {tab === "reminders" && settings ? (
        <div className="sk-surface-card max-w-2xl space-y-4 p-6 shadow-sm">
          <p className="text-sm text-sk-ink/70">{brand.labels.commsEnvFallbackNote}</p>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-sk-ink">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-sk-ink/30"
            />
            {brand.labels.commsRemindersEnabled}
          </label>
          <label className="block text-sm text-sk-ink">
            {brand.labels.commsHoursBeforeLabel}
            <input
              type="number"
              step="0.25"
              min={0.5}
              className="mt-1 w-full rounded-lg border border-sk-ink/15 px-3 py-2"
              value={hoursBefore}
              onChange={(e) => setHoursBefore(e.target.value)}
            />
            <span className="mt-1 block text-xs text-sk-ink/55">
              {brand.labels.commsHoursBeforeHint}
            </span>
          </label>
          <label className="block text-sm text-sk-ink">
            {brand.labels.commsWindowHoursLabel}
            <input
              type="number"
              step="0.05"
              min={0.05}
              className="mt-1 w-full rounded-lg border border-sk-ink/15 px-3 py-2"
              value={windowH}
              onChange={(e) => setWindowH(e.target.value)}
            />
            <span className="mt-1 block text-xs text-sk-ink/55">
              {brand.labels.commsWindowHoursHint}
            </span>
          </label>
          <label className="block text-sm text-sk-ink">
            {brand.labels.commsPollIntervalLabel}
            <input
              type="number"
              step={1000}
              min={10_000}
              className="mt-1 w-full rounded-lg border border-sk-ink/15 px-3 py-2"
              value={pollMs}
              onChange={(e) => setPollMs(e.target.value)}
            />
            <span className="mt-1 block text-xs text-sk-ink/55">
              {brand.labels.commsPollIntervalHint}
            </span>
          </label>
          <div>
            <span className="text-sm font-medium text-sk-ink">
              {brand.labels.commsMediumLabel}
            </span>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              {(
                [
                  ["email", brand.labels.commsMediumEmail],
                  ["sms", brand.labels.commsMediumSms],
                  ["both", brand.labels.commsMediumBoth],
                ] as const
              ).map(([v, lab]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="medium"
                    checked={medium === v}
                    onChange={() => setMedium(v)}
                    className="h-4 w-4 border-sk-ink/30"
                  />
                  {lab}
                </label>
              ))}
            </div>
          </div>
          <label className="block text-sm text-sk-ink">
            {brand.labels.commsSmsWebhookLabel}
            <input
              className="mt-1 w-full rounded-lg border border-sk-ink/15 px-3 py-2 font-mono text-xs"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://…"
            />
            <span className="mt-1 block text-xs text-sk-ink/55">
              {brand.labels.commsSmsWebhookHint}
            </span>
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={savingRem}
              onClick={() => void saveReminders()}
              className="rounded-lg bg-sk-brand px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {brand.labels.commsSave}
            </button>
            <button
              type="button"
              disabled={savingRem}
              onClick={() => void resetReminders()}
              className="rounded-lg border border-sk-ink/20 bg-white px-4 py-2 text-sm text-sk-ink hover:bg-sk-surface"
            >
              {brand.labels.commsResetEnvDefaults}
            </button>
          </div>
        </div>
      ) : null}

      {tab === "newsletter" ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div
              className="rounded-2xl bg-gradient-to-br from-[#0c1f3a] via-[#1B4F8A] to-[#4A7EC7] p-6 text-white shadow-xl"
              style={{
                boxShadow: "0 20px 50px rgba(27, 79, 138, 0.35)",
              }}
            >
              <h3 className="text-lg font-bold tracking-tight">
                {brand.labels.commsTabNewsletter}
              </h3>
              <p className="mt-2 text-sm text-white/85">{brand.labels.commsPageLead}</p>
              {settings ? (
                <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {brand.labels.newsletterRecipientBadge}:{" "}
                  {settings.newsletterRecipientCount}
                </p>
              ) : null}
            </div>

            <div className="sk-surface-card space-y-3 p-5">
              <label className="block text-sm font-medium text-sk-ink">
                {brand.labels.newsletterSubjectLabel}
                <input
                  className="mt-1 w-full rounded-lg border border-sk-ink/15 px-3 py-2"
                  value={subj}
                  onChange={(e) => setSubj(e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium text-sk-ink">
                {brand.labels.newsletterHtmlLabel}
                <textarea
                  className="mt-1 min-h-[200px] w-full rounded-lg border border-sk-ink/15 px-3 py-2 font-mono text-xs"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                />
                <span className="mt-1 block text-xs text-sk-ink/55">
                  {brand.labels.newsletterHtmlHint}
                </span>
              </label>
              <button
                type="button"
                disabled={busyNews}
                onClick={() => void createDraft()}
                className="rounded-lg bg-gradient-to-r from-sk-brand to-[#4A7EC7] px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-95 disabled:opacity-50"
              >
                {brand.labels.newsletterCreateDraft}
              </button>
            </div>

            <div className="sk-surface-card p-5">
              <h4 className="text-sm font-semibold text-sk-ink">
                {brand.labels.newsletterHistoryTitle}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                {(campaigns ?? []).map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sk-ink/10 bg-sk-surface/80 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-sk-ink">{c.subject}</div>
                      <div className="text-xs text-sk-ink/55">
                        {c.status === "sent"
                          ? brand.labels.newsletterStatusSent
                          : brand.labels.newsletterStatusDraft}
                        {c.status === "sent"
                          ? ` · ${brand.labels.newsletterSentCountTemplate.replace("{sent}", String(c.sentCount)).replace("{total}", String(c.recipientCount))}`
                          : null}
                      </div>
                    </div>
                    {c.status === "draft" ? (
                      <button
                        type="button"
                        disabled={busyNews}
                        onClick={() => void sendCampaign(c.id)}
                        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-sk-ink hover:bg-amber-400 disabled:opacity-50"
                      >
                        {brand.labels.newsletterSendNow}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <h4 className="mb-2 text-sm font-semibold text-sk-ink">
              {brand.labels.newsletterPreviewTitle} — {previewName}
            </h4>
            <div
              className="overflow-hidden rounded-2xl border border-sk-ink/15 shadow-lg"
              style={{ minHeight: 420 }}
            >
              <iframe
                title="Newsletter preview"
                className="h-[520px] w-full bg-white"
                sandbox="allow-same-origin"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0">${wrapNewsletterHtml(html, previewName)}</body></html>`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
