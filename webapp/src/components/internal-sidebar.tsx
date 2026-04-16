"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useAppToast } from "@/components/app-toast";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";

function navActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InternalSidebar({
  ascent = false,
  isAdmin,
  showInvoices = true,
  showChat = true,
  mobileOpen = false,
  onNavigate,
}: {
  ascent?: boolean;
  isAdmin: boolean;
  showInvoices?: boolean;
  showChat?: boolean;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const {
    successToastsEnabled,
    infoToastsEnabled,
    sessionQuietModeEnabled,
    toggleSuccessToasts,
    toggleInfoToasts,
    toggleSessionQuietMode,
  } = useAppToast();
  const { data } = useSWR<{ count: number }>(
    isAdmin ? "/api/admin/requests/count" : null,
    (url) => fetchJson<{ count: number }>(url),
    { refreshInterval: 30_000, keepPreviousData: true }
  );
  const badge = data?.count ?? 0;
  const appVersion = (process.env.NEXT_PUBLIC_APP_VERSION ?? "dev").trim();

  function linkClass(href: string, extra = ""): string {
    const on = navActive(href, pathname);
    return [
      "block rounded px-2 py-2 text-white/95 transition-colors",
      on ? "bg-white/25 font-medium text-white" : "hover:bg-white/15",
      extra,
    ].join(" ");
  }

  const asideBase = ascent
    ? "fixed left-0 top-0 z-40 flex h-full w-[min(88vw,220px)] flex-col rounded-r-3xl bg-gradient-to-b from-[var(--ascent-primary)] to-[#004494] text-white shadow-[4px_0_28px_rgba(0,88,188,0.22)] transition-transform duration-200 ease-out md:z-10 md:w-[220px] md:translate-x-0"
    : "fixed left-0 top-0 z-40 flex h-full w-[min(88vw,220px)] flex-col rounded-r-3xl bg-sk-brand text-white shadow-sk-nav transition-transform duration-200 ease-out md:z-10 md:w-[220px] md:translate-x-0";

  return (
    <aside
      className={[
        asideBase,
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-sm font-semibold tracking-tight">{brand.siteName}</div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
          {brand.labels.navTeam}
        </div>
        {sessionQuietModeEnabled ? (
          <button
            type="button"
            onClick={toggleSessionQuietMode}
            className="mt-2 inline-block rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold text-sk-ink hover:bg-amber-300"
            title={brand.labels.toastSessionQuietOff}
          >
            {brand.labels.toastSessionQuietBadge}
          </button>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3 text-sm">
        <Link
          className={linkClass("/kalender")}
          href="/kalender"
          onClick={onNavigate}
        >
          {brand.labels.navCalendar}
        </Link>
        <Link
          className={linkClass("/gaeste")}
          href="/gaeste"
          onClick={onNavigate}
        >
          {brand.labels.clientPlural}
        </Link>
        {showInvoices ? (
          <Link
            className={linkClass("/rechnungen")}
            href="/rechnungen"
            onClick={onNavigate}
          >
            {brand.labels.navInvoices}
          </Link>
        ) : null}
        <Link
          className={linkClass("/stundenreport")}
          href="/stundenreport"
          onClick={onNavigate}
        >
          {brand.labels.navMonthlyHoursReport}
        </Link>
        <Link
          className={linkClass("/lohnabrechnung")}
          href="/lohnabrechnung"
          onClick={onNavigate}
        >
          {brand.labels.navPayroll}
        </Link>
        {showChat ? (
          <Link className={linkClass("/chat")} href="/chat" onClick={onNavigate}>
            {brand.labels.navChat}
          </Link>
        ) : null}
        {isAdmin ? (
          <>
            <div className="my-2 border-t border-white/10" />
            <Link className={linkClass("/admin")} href="/admin" onClick={onNavigate}>
              {brand.labels.navAdmin}
            </Link>
            <Link
              className={linkClass("/admin/anfragen", "flex items-center justify-between gap-2")}
              href="/admin/anfragen"
              onClick={onNavigate}
            >
              <span>{brand.labels.requestPlural}</span>
              {badge > 0 ? (
                <span className="shrink-0 rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-semibold text-sk-ink">
                  {badge}
                </span>
              ) : null}
            </Link>
            <Link
              className={linkClass("/admin/audit")}
              href="/admin/audit"
              onClick={onNavigate}
            >
              {brand.labels.navAudit}
            </Link>
          </>
        ) : null}
      </nav>
      <div className="border-t border-white/10 px-4 py-2">
        <button
          type="button"
          onClick={toggleSuccessToasts}
          className="mb-1 block rounded px-1 py-0.5 text-[10px] text-white/65 hover:bg-white/10 hover:text-white"
        >
          {successToastsEnabled
            ? brand.labels.toastSuccessOn
            : brand.labels.toastSuccessOff}
        </button>
        <button
          type="button"
          onClick={toggleSessionQuietMode}
          className="mb-1 block rounded px-1 py-0.5 text-[10px] text-white/65 hover:bg-white/10 hover:text-white"
        >
          {sessionQuietModeEnabled
            ? brand.labels.toastSessionQuietOn
            : brand.labels.toastSessionQuietOff}
        </button>
        <button
          type="button"
          onClick={toggleInfoToasts}
          className="mb-1 block rounded px-1 py-0.5 text-[10px] text-white/65 hover:bg-white/10 hover:text-white"
        >
          {infoToastsEnabled
            ? brand.labels.toastInfoOn
            : brand.labels.toastInfoOff}
        </button>
        <div className="px-1 font-mono text-[11px] text-white/55">
          v {appVersion}
        </div>
      </div>
      <UserAvatar />
    </aside>
  );
}
