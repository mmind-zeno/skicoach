"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { FetchJsonError, fetchJson } from "@/lib/client-fetch";

type FeedLinkPayload = {
  data: {
    httpsUrl: string;
    webcalUrl: string;
    approxValidDays: number;
  };
};

async function feedLinkFetcher(url: string) {
  const json = await fetchJson<FeedLinkPayload>(url);
  return json.data;
}

export function ExternalCalendarSubscribeCard() {
  const { data, error, isLoading } = useSWR(
    "/api/calendar/feed-link",
    feedLinkFetcher,
    { revalidateOnFocus: false }
  );
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const copy = useCallback(
    async (text: string, okMsg: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(okMsg);
      } catch {
        showToast(brand.labels.calendarExternalCopyFailed);
      }
    },
    [showToast]
  );

  if (isLoading) {
    return (
      <div className="sk-surface-card p-4 text-sm text-sk-ink/60">
        {brand.labels.calendarExternalLoading}
      </div>
    );
  }

  if (error) {
    const status = error instanceof FetchJsonError ? error.status : 0;
    if (status === 404) {
      return null;
    }
    return (
      <div className="sk-surface-card p-4 text-sm text-red-700" role="alert">
        {brand.labels.calendarExternalLoadError}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="sk-surface-card p-4 text-sm text-sk-ink">
      <h2 className="text-base font-semibold text-sk-ink">
        {brand.labels.calendarExternalSubscribeTitle}
      </h2>
      <p className="mt-1 text-sk-ink/75">
        {brand.labels.calendarExternalSubscribeLead}
      </p>
      <p className="mt-2 text-xs text-amber-900/90 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-1.5">
        {brand.labels.calendarExternalPrivacyNote}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <label className="block">
          <span className="text-xs font-medium text-sk-ink/60">
            {brand.labels.calendarExternalHttpsUrlLabel}
          </span>
          <div className="mt-0.5 flex flex-wrap gap-2">
            <input
              readOnly
              className="sk-field min-w-[12rem] flex-1 font-mono text-xs"
              value={data.httpsUrl}
              aria-label={brand.labels.calendarExternalHttpsUrlLabel}
            />
            <button
              type="button"
              className="sk-btn sk-btn-secondary text-xs"
              onClick={() =>
                void copy(
                  data.httpsUrl,
                  brand.labels.calendarExternalCopiedToast
                )
              }
            >
              {brand.labels.calendarExternalCopyButton}
            </button>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-sk-ink/60">
            {brand.labels.calendarExternalWebcalUrlLabel}
          </span>
          <div className="mt-0.5 flex flex-wrap gap-2">
            <input
              readOnly
              className="sk-field min-w-[12rem] flex-1 font-mono text-xs"
              value={data.webcalUrl}
              aria-label={brand.labels.calendarExternalWebcalUrlLabel}
            />
            <button
              type="button"
              className="sk-btn sk-btn-secondary text-xs"
              onClick={() =>
                void copy(
                  data.webcalUrl,
                  brand.labels.calendarExternalCopiedToast
                )
              }
            >
              {brand.labels.calendarExternalCopyButton}
            </button>
            <a
              className="sk-btn sk-btn-primary text-xs inline-flex items-center justify-center no-underline"
              href={data.webcalUrl}
            >
              {brand.labels.calendarExternalOpenWebcal}
            </a>
          </div>
        </label>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sk-ink/80">
        <li>{brand.labels.calendarExternalInstructionsGoogle}</li>
        <li>{brand.labels.calendarExternalInstructionsOutlook}</li>
        <li>{brand.labels.calendarExternalInstructionsApple}</li>
      </ul>

      {toast ? (
        <p className="mt-2 text-xs text-emerald-800" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
