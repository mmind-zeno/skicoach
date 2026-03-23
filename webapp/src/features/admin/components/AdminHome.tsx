"use client";

import { CHFAmount } from "@/components/ui/CHFAmount";
import { MetricCard } from "@/components/ui/MetricCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";

async function f<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

type Tab = "dash" | "users" | "courses";

export function AdminHome() {
  const { data: session } = useSession();
  const meId = session?.user?.id ?? "";
  const [tab, setTab] = useState<Tab>("dash");
  const { data: statsPack } = useSWR(
    "/api/admin/stats",
    f<{
      stats: {
        bookingsThisMonth: number;
        revenueThisMonth: number;
        activeTeachers: number;
        totalGuests: number;
      };
      byTeacher: { teacher: string; revenue: number; bookingCount: number }[];
      byMonth: { month: number; count: number }[];
    }>,
    { refreshInterval: 60_000 }
  );

  const { data: users, mutate: muUsers } = useSWR(
    tab === "users" ? "/api/admin/users" : null,
    f<
      {
        id: string;
        name: string | null;
        email: string;
        role: string;
        isActive: boolean;
      }[]
    >
  );

  const { data: courses, mutate: muCourses } = useSWR(
    tab === "courses" ? "/api/admin/course-types" : null,
    f<Record<string, unknown>[]>
  );

  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-sk-ink/10 pb-2 text-sm">
        {(
          [
            ["dash", brand.labels.navDashboard],
            [
              "users",
              `${brand.labels.staffCollectivePlural} & Nutzer`,
            ],
            ["courses", brand.labels.serviceTypePlural],
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded px-3 py-1.5 ${
              tab === k
                ? "bg-sk-brand text-white"
                : "bg-sk-surface text-sk-ink hover:bg-sk-ink/10"
            }`}
          >
            {lab}
          </button>
        ))}
        <Link
          href="/admin/anfragen"
          className="rounded bg-amber-100 px-3 py-1.5 text-amber-900"
        >
          {brand.labels.bookingRequestPlural} →
        </Link>
        <Link
          href="/admin/audit"
          className="rounded border border-sk-ink/15 bg-sk-surface px-3 py-1.5 text-sk-ink hover:border-sk-brand/40"
        >
          {brand.labels.navAuditLog} →
        </Link>
      </div>

      {tab === "dash" && statsPack ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label={`${brand.labels.bookingPlural} (Monat)`}
              value={String(statsPack.stats.bookingsThisMonth)}
              sub="Im laufenden Kalendermonat"
            />
            <MetricCard
              label="Umsatz"
              value={
                <CHFAmount amount={statsPack.stats.revenueThisMonth} size="xl" />
              }
              sub="Summe Preise (nicht storniert), aktueller Monat"
            />
            <MetricCard
              label={`Aktive ${brand.labels.staffCollectivePlural}`}
              value={String(statsPack.stats.activeTeachers)}
            />
            <MetricCard
              label={`${brand.labels.clientPlural} total`}
              value={String(statsPack.stats.totalGuests)}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-sk-ink">
              {brand.labels.bookingPlural} pro Monat ({new Date().getFullYear()})
            </h3>
            <div className="mt-2 flex h-36 items-end gap-1.5 rounded-lg bg-sk-surface/80 px-1 pb-1 pt-2">
              {(() => {
                const maxC = Math.max(
                  1,
                  ...statsPack.byMonth.map((x) => x.count)
                );
                return statsPack.byMonth.map((m) => (
                  <div
                    key={m.month}
                    className="group flex min-w-0 flex-1 flex-col items-center"
                  >
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-[#1B4F8A] to-sky-400/90 shadow-sm ring-1 ring-sk-brand/10 transition group-hover:to-sky-300"
                      style={{
                        height: `${(m.count / maxC) * 100}%`,
                        minHeight: m.count ? 8 : 0,
                      }}
                      title={`${m.count} ${brand.labels.bookingPlural}`}
                    />
                    <span className="mt-1 text-[10px] font-medium tabular-nums text-sk-ink/55">
                      {m.month}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-sk-ink">
              Umsatz pro {brand.labels.staffCollectivePlural} (Monat)
            </h3>
            <p className="mt-0.5 text-xs text-sk-ink/50">
              Balken relativ zum höchsten Umsatz in der Liste
            </p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-sk-ink/60">
                  <th className="py-1">{brand.labels.staffSingular}</th>
                  <th>{brand.labels.bookingPlural}</th>
                  <th>CHF</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const maxRev = Math.max(
                    1,
                    ...statsPack.byTeacher.map((x) => x.revenue)
                  );
                  return statsPack.byTeacher.map((t) => {
                    const pct = Math.round((t.revenue / maxRev) * 100);
                    return (
                      <tr key={t.teacher} className="border-t border-sk-ink/5">
                        <td className="relative max-w-[200px] py-2 pr-2">
                          <div
                            className="absolute inset-y-1 left-0 rounded-md bg-gradient-to-r from-sk-brand/18 to-sk-brand/5"
                            style={{ width: `${pct}%` }}
                            aria-hidden
                          />
                          <span className="relative z-[1] truncate font-medium">
                            {t.teacher}
                          </span>
                        </td>
                        <td className="relative z-[1] tabular-nums text-sk-ink/80">
                          {t.bookingCount}
                        </td>
                        <td className="relative z-[1]">
                          <CHFAmount amount={t.revenue} size="sm" />
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "dash" && !statsPack ? (
        <p className="text-sm text-sk-ink/60">
          {brand.labels.adminDashboardLoading}
        </p>
      ) : null}

      {tab === "users" ? (
        <div className="space-y-4">
          {!users ? (
            <p className="text-sm text-sk-ink/60">
              {brand.labels.adminUserListLoading}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <input
              className="rounded border px-2 py-2 text-sm"
              placeholder={brand.labels.adminInviteEmailPlaceholder}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              type="button"
              className="rounded bg-sk-brand px-3 py-2 text-sm text-white"
              onClick={async () => {
                const res = await fetch("/api/admin/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: inviteEmail }),
                });
                const data = (await res.json().catch(() => ({}))) as {
                  error?: string;
                };
                if (!res.ok) {
                  window.alert(
                    data.error ??
                      brand.labels.uiErrorHttpTemplate.replace(
                        "{status}",
                        String(res.status)
                      )
                  );
                  return;
                }
                setInviteEmail("");
                void muUsers();
              }}
            >
              {brand.labels.adminSendMagicLink}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-sk-ink/60">
                <th className="py-1">{brand.labels.labelName}</th>
                <th>{brand.labels.labelEmail}</th>
                <th>{brand.labels.labelRole}</th>
                <th>{brand.labels.labelActive}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-sk-ink/60">
                    {brand.labels.adminUsersEmptyHint}
                  </td>
                </tr>
              ) : null}
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-sk-ink/5">
                  <td className="py-1">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? "ja" : "nein"}</td>
                  <td className="space-x-2">
                    {u.isActive ? (
                      <button
                        type="button"
                        className="text-xs text-sk-brand underline"
                        onClick={async () => {
                          const res = await fetch("/api/admin/users/resend-invite", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: u.email }),
                          });
                          const data = (await res.json().catch(() => ({}))) as {
                            error?: string;
                          };
                          if (!res.ok) {
                            window.alert(
                              data.error ??
                                brand.labels.uiErrorHttpTemplate.replace(
                                  "{status}",
                                  String(res.status)
                                )
                            );
                            return;
                          }
                          window.alert(
                            brand.labels.adminMagicLinkResentToast
                          );
                        }}
                      >
                        {brand.labels.adminResendMagicLink}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-emerald-700 underline"
                        onClick={async () => {
                          const res = await fetch(`/api/admin/users/${u.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: true }),
                          });
                          const j = (await res.json().catch(() => ({}))) as {
                            error?: string;
                          };
                          if (!res.ok) {
                            window.alert(
                              j.error ?? brand.labels.adminActivateUserFailed
                            );
                            return;
                          }
                          void muUsers();
                        }}
                      >
                        {brand.labels.adminActivateUser}
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-xs text-sk-brand underline disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={u.id === meId}
                      title={
                        u.id === meId
                          ? brand.labels.adminCannotChangeOwnRoleHere
                          : undefined
                      }
                      onClick={async () => {
                        const res = await fetch(`/api/admin/users/${u.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            role: u.role === "admin" ? "teacher" : "admin",
                          }),
                        });
                        if (!res.ok) {
                          const j = (await res.json().catch(() => ({}))) as {
                            error?: string;
                          };
                          window.alert(
                            j.error ?? brand.labels.adminRoleChangeFailed
                          );
                          return;
                        }
                        void muUsers();
                      }}
                    >
                      {brand.labels.adminRoleToggle}
                    </button>
                    {u.isActive && u.id !== meId ? (
                      <button
                        type="button"
                        className="text-xs text-red-600 underline"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `${u.email} wirklich deaktivieren? Login ist danach nicht mehr möglich.`
                            )
                          ) {
                            return;
                          }
                          const res = await fetch(`/api/admin/users/${u.id}`, {
                            method: "DELETE",
                          });
                          const j = (await res.json().catch(() => ({}))) as {
                            error?: string;
                          };
                          if (!res.ok) {
                            window.alert(
                              j.error ?? brand.labels.adminDeactivateUserFailed
                            );
                            return;
                          }
                          void muUsers();
                        }}
                      >
                        {brand.labels.adminDeactivateUser}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "courses" ? (
        <CourseTypeAdmin
          list={courses}
          onChange={() => void muCourses()}
        />
      ) : null}
    </div>
  );
}

function CourseTypeAdmin({
  list,
  onChange,
}: {
  list: Record<string, unknown>[] | undefined;
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [dur, setDur] = useState(60);
  const [price, setPrice] = useState("120");
  const [maxP, setMaxP] = useState(1);
  const [pub, setPub] = useState(true);

  if (!list) {
    return (
      <p className="text-sm text-sk-ink/60">
        {brand.labels.serviceTypePlural} werden geladen…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded border border-sk-ink/10 p-3 text-sm sm:grid-cols-2">
        <input
          className="rounded border px-2 py-1"
          placeholder={brand.labels.adminCoursePlaceholderName}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="rounded border px-2 py-1"
          placeholder={brand.labels.adminCoursePlaceholderDurationMin}
          value={dur}
          onChange={(e) => setDur(Number(e.target.value))}
        />
        <input
          className="rounded border px-2 py-1"
          placeholder={brand.labels.adminCoursePlaceholderPriceChf}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          className="rounded border px-2 py-1"
          placeholder={brand.labels.adminCoursePlaceholderMaxParticipants}
          value={maxP}
          onChange={(e) => setMaxP(Number(e.target.value))}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pub}
            onChange={(e) => setPub(e.target.checked)}
          />
          {brand.labels.adminCoursePublicPortalLabel}
        </label>
        <button
          type="button"
          className="rounded bg-sk-brand px-3 py-2 text-white"
          onClick={async () => {
            const res = await fetch("/api/admin/course-types", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                durationMin: dur,
                priceCHF: price,
                maxParticipants: maxP,
                isPublic: pub,
              }),
            });
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
              window.alert(
                j.error ??
                  `${brand.labels.serviceTypeSingular} konnte nicht angelegt werden`
              );
              return;
            }
            setName("");
            onChange();
          }}
        >
          {brand.labels.adminCourseCreateButton}
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-sk-ink/60">
          Noch keine {brand.labels.serviceTypePlural}. Oben anlegen oder per
          Seed/Migration füllen.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((c) => (
            <li
              key={String(c.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-sk-ink/10 px-3 py-2"
            >
              <span>
                {String(c.name)} · {String(c.durationMin)} Min · CHF{" "}
                {String(c.priceCHF)}
              </span>
              <button
                type="button"
                className="text-xs text-red-600 underline"
                onClick={async () => {
                  const res = await fetch(`/api/admin/course-types/${c.id}`, {
                    method: "DELETE",
                  });
                  const j = (await res.json().catch(() => ({}))) as {
                    error?: string;
                  };
                  if (!res.ok) {
                    window.alert(
                      j.error ?? brand.labels.uiDeleteFailed
                    );
                    return;
                  }
                  onChange();
                }}
              >
                {brand.labels.uiDelete}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
