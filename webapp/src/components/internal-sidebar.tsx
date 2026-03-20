"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { UserAvatar } from "@/features/auth/components/UserAvatar";

function navActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InternalSidebar({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const pathname = usePathname() ?? "";
  const { data } = useSWR<{ count: number }>(
    isAdmin ? "/api/admin/requests/count" : null,
    (url) => fetch(url).then((r) => r.json()),
    { refreshInterval: 30_000 }
  );
  const badge = data?.count ?? 0;

  function linkClass(href: string, extra = ""): string {
    const on = navActive(href, pathname);
    return [
      "block rounded px-2 py-2 text-white/95 transition-colors",
      on ? "bg-white/25 font-medium text-white" : "hover:bg-white/15",
      extra,
    ].join(" ");
  }

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-full w-[220px] flex-col bg-sk-brand text-white shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-sm font-semibold tracking-tight">skicoach</div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
          Team
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3 text-sm">
        <Link className={linkClass("/kalender")} href="/kalender">
          Kalender
        </Link>
        <Link className={linkClass("/gaeste")} href="/gaeste">
          Gäste
        </Link>
        <Link className={linkClass("/rechnungen")} href="/rechnungen">
          Rechnungen
        </Link>
        <Link className={linkClass("/chat")} href="/chat">
          Chat
        </Link>
        {isAdmin ? (
          <>
            <div className="my-2 border-t border-white/10" />
            <Link className={linkClass("/admin")} href="/admin">
              Admin
            </Link>
            <Link
              className={linkClass("/admin/anfragen", "flex items-center justify-between gap-2")}
              href="/admin/anfragen"
            >
              <span>Anfragen</span>
              {badge > 0 ? (
                <span className="shrink-0 rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-semibold text-sk-ink">
                  {badge}
                </span>
              ) : null}
            </Link>
            <Link className={linkClass("/admin/audit")} href="/admin/audit">
              Audit
            </Link>
          </>
        ) : null}
      </nav>
      <div className="border-t border-white/10 px-4 py-2 text-[10px] text-white/50">
        v{process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}
      </div>
      <UserAvatar />
    </aside>
  );
}
