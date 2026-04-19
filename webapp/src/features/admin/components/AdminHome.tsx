"use client";

import { CHFAmount } from "@/components/ui/CHFAmount";
import { MetricCard } from "@/components/ui/MetricCard";
import { useAppToast } from "@/components/app-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { StaffWeeklyHoursAdmin } from "@/features/admin/components/StaffWeeklyHoursAdmin";
import { MonthlyHoursReportPanel } from "@/features/reports/MonthlyHoursReportPanel";
import { PayrollMonthPanel } from "@/features/reports/PayrollMonthPanel";

function f<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

type Tab = "dash" | "users" | "courses" | "hours" | "reports" | "payroll";

export function AdminHome() {
  const { data: session } = useSession();
  const { showToast } = useAppToast();
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
    { refreshInterval: 60_000, keepPreviousData: true }
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
    >,
    { keepPreviousData: true }
  );

  const { data: courses, mutate: muCourses } = useSWR(
    tab === "courses" ? "/api/admin/course-types" : null,
    f<Record<string, unknown>[]>,
    { keepPreviousData: true }
  );

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"teacher" | "admin">("teacher");
  const [userActionError, setUserActionError] = useState<UiErrorInfo | null>(null);

  useEffect(() => {
    if (tab !== "users") {
      setUserActionError(null);
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 pb-1 text-sm">
        {(
          [
            ["dash", brand.labels.navDashboard],
            [
              "users",
              brand.labels.adminTabStaffUsersTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              ),
            ],
            ["courses", brand.labels.serviceTypePlural],
            ["hours", brand.labels.adminTabWeeklyHours],
            ["reports", brand.labels.adminTabMonthlyReport],
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
          className="rounded-lg bg-sk-container-high/60 px-3 py-1.5 text-sk-ink shadow-[inset_0_0_0_1px_rgba(225,191,181,0.2)] transition hover:bg-sk-highlight/50"
        >
          {brand.labels.navAuditLog} →
        </Link>
      </div>

      {tab === "dash" && statsPack ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label={brand.labels.adminMetricBookingsMonthLabelTemplate.replace(
                "{bookingPlural}",
                brand.labels.bookingPlural
              )}
              value={String(statsPack.stats.bookingsThisMonth)}
              sub={brand.labels.adminMetricBookingsMonthSub}
            />
            <MetricCard
              label={brand.labels.adminMetricRevenueLabel}
              value={
                <CHFAmount amount={statsPack.stats.revenueThisMonth} size="xl" />
              }
              sub={brand.labels.adminMetricRevenueSub}
            />
            <MetricCard
              label={brand.labels.adminMetricActiveStaffLabelTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              )}
              value={String(statsPack.stats.activeTeachers)}
            />
            <MetricCard
              label={brand.labels.adminMetricGuestsTotalLabelTemplate.replace(
                "{clientPlural}",
                brand.labels.clientPlural
              )}
              value={String(statsPack.stats.totalGuests)}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-sk-ink">
              {brand.labels.adminChartBookingsByMonthTitleTemplate
                .replace("{bookingPlural}", brand.labels.bookingPlural)
                .replace("{year}", String(new Date().getFullYear()))}
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
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-sk-cta to-sk-cta-mid shadow-sm ring-1 ring-sk-cta/15 transition group-hover:brightness-110"
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
              {brand.labels.adminChartRevenueByStaffTitleTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              )}
            </h3>
            <p className="mt-0.5 text-xs text-sk-ink/50">
              {brand.labels.adminChartRevenueByStaffHint}
            </p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-sk-ink/60">
                  <th className="py-1">{brand.labels.staffSingular}</th>
                  <th>{brand.labels.bookingPlural}</th>
                  <th>{brand.labels.adminStatsTableHeaderChf}</th>
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
          {userActionError ? (
            <p className="text-sm text-red-600" role="alert">
              {userActionError.message}
              {userActionError.requestId ? (
                <span className="block text-xs text-red-700/80">
                  Ref: {userActionError.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-0.5 text-xs text-sk-ink/70">
              <span>{brand.labels.labelEmail}</span>
              <input
                className="rounded border px-2 py-2 text-sm text-sk-ink"
                placeholder={brand.labels.adminInviteEmailPlaceholder}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-0.5 text-xs text-sk-ink/70">
              <span>{brand.labels.labelName}</span>
              <input
                className="rounded border px-2 py-2 text-sm text-sk-ink"
                placeholder={brand.labels.adminInviteNamePlaceholder}
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-0.5 text-xs text-sk-ink/70">
              <span>{brand.labels.labelRole}</span>
              <select
                className="rounded border bg-white px-2 py-2 text-sm text-sk-ink"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value === "admin" ? "admin" : "teacher")
                }
              >
                <option value="teacher">{brand.labels.staffSingular}</option>
                <option value="admin">{brand.labels.navAdmin}</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-sm text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid"
              onClick={async () => {
                setUserActionError(null);
                try {
                  await fetchJson("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: inviteEmail,
                      name: inviteName.trim() || undefined,
                      role: inviteRole,
                    }),
                  });
                  setInviteEmail("");
                  setInviteName("");
                  setInviteRole("teacher");
                  void muUsers();
                } catch (e) {
                  setUserActionError(getUiErrorInfo(e, brand.labels.uiErrorGeneric));
                }
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
                  <td className="py-1">
                    <UserNameCell
                      userId={u.id}
                      initialName={u.name}
                      onSave={async (name) => {
                        setUserActionError(null);
                        await fetchJson(`/api/admin/users/${u.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name }),
                        });
                        void muUsers();
                        showToast(brand.labels.adminUserNameSavedToast, "success");
                      }}
                      onError={(e) =>
                        setUserActionError(
                          getUiErrorInfo(e, brand.labels.uiSaveFailed)
                        )
                      }
                    />
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="max-w-[10rem] rounded border bg-white px-1 py-1 text-sm"
                      value={u.role}
                      disabled={u.id === meId}
                      title={
                        u.id === meId
                          ? brand.labels.adminCannotChangeOwnRoleHere
                          : undefined
                      }
                      onChange={async (e) => {
                        const role = e.target.value as "admin" | "teacher";
                        if (role === u.role) return;
                        setUserActionError(null);
                        try {
                          await fetchJson(`/api/admin/users/${u.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ role }),
                          });
                          void muUsers();
                        } catch (err) {
                          setUserActionError(
                            getUiErrorInfo(err, brand.labels.adminRoleChangeFailed)
                          );
                        }
                      }}
                    >
                      <option value="teacher">{brand.labels.staffSingular}</option>
                      <option value="admin">{brand.labels.navAdmin}</option>
                    </select>
                  </td>
                  <td>
                    {u.isActive ? brand.labels.uiYes : brand.labels.uiNo}
                  </td>
                  <td className="space-x-2">
                    {u.isActive ? (
                      <button
                        type="button"
                        className="text-xs text-sk-brand underline"
                        onClick={async () => {
                          setUserActionError(null);
                          try {
                            await fetchJson("/api/admin/users/resend-invite", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: u.email }),
                            });
                            showToast(brand.labels.adminMagicLinkResentToast, "success");
                          } catch (e) {
                            setUserActionError(
                              getUiErrorInfo(e, brand.labels.uiErrorGeneric)
                            );
                          }
                        }}
                      >
                        {brand.labels.adminResendMagicLink}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-emerald-700 underline"
                        onClick={async () => {
                          setUserActionError(null);
                          try {
                            await fetchJson(`/api/admin/users/${u.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isActive: true }),
                            });
                            void muUsers();
                          } catch (e) {
                            setUserActionError(
                              getUiErrorInfo(e, brand.labels.adminActivateUserFailed)
                            );
                          }
                        }}
                      >
                        {brand.labels.adminActivateUser}
                      </button>
                    )}
                    {u.isActive && u.id !== meId ? (
                      <button
                        type="button"
                        className="text-xs text-red-600 underline"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              brand.labels.adminConfirmDeactivateUserTemplate.replace(
                                "{email}",
                                u.email
                              )
                            )
                          ) {
                            return;
                          }
                          setUserActionError(null);
                          try {
                            await fetchJson(`/api/admin/users/${u.id}`, {
                              method: "DELETE",
                            });
                            void muUsers();
                          } catch (e) {
                            setUserActionError(
                              getUiErrorInfo(e, brand.labels.adminDeactivateUserFailed)
                            );
                          }
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

      {tab === "hours" ? <StaffWeeklyHoursAdmin /> : null}

      {tab === "reports" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.monthlyHoursReportTitle}
          </h2>
          <MonthlyHoursReportPanel isAdmin />
        </div>
      ) : null}

      {tab === "payroll" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-sk-ink">
            {brand.labels.payrollPageTitle}
          </h2>
          <PayrollMonthPanel isAdmin />
        </div>
      ) : null}
    </div>
  );
}

function UserNameCell({
  userId,
  initialName,
  onSave,
  onError,
}: {
  userId: string;
  initialName: string | null;
  onSave: (name: string) => Promise<void>;
  onError: (e: unknown) => void;
}) {
  const [val, setVal] = useState(initialName ?? "");
  useEffect(() => {
    setVal(initialName ?? "");
  }, [initialName, userId]);
  const trimmed = val.trim();
  const initialTrimmed = (initialName ?? "").trim();
  const dirty = trimmed !== initialTrimmed;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <input
        className="max-w-[11rem] rounded border px-1 py-0.5 text-sm"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        aria-label={brand.labels.labelName}
      />
      <button
        type="button"
        disabled={!dirty}
        className="whitespace-nowrap text-xs text-sk-brand underline disabled:opacity-40"
        onClick={async () => {
          try {
            await onSave(trimmed);
          } catch (e) {
            onError(e);
          }
        }}
      >
        {brand.labels.uiSave}
      </button>
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
  const [courseErr, setCourseErr] = useState<UiErrorInfo | null>(null);

  if (!list) {
    return (
      <p className="text-sm text-sk-ink/60">
        {brand.labels.adminCourseTypesLoadingTemplate.replace(
          "{serviceTypePlural}",
          brand.labels.serviceTypePlural
        )}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {courseErr ? (
        <p className="text-sm text-red-600" role="alert">
          {courseErr.message}
          {courseErr.requestId ? (
            <span className="block text-xs text-red-700/80">
              Ref: {courseErr.requestId}
            </span>
          ) : null}
        </p>
      ) : null}
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
          className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid"
          onClick={async () => {
            setCourseErr(null);
            try {
              await fetchJson("/api/admin/course-types", {
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
              setName("");
              onChange();
            } catch (e) {
              setCourseErr(
                getUiErrorInfo(
                  e,
                  brand.labels.adminCourseTypeCreateFailedTemplate.replace(
                    "{serviceTypeSingular}",
                    brand.labels.serviceTypeSingular
                  )
                )
              );
            }
          }}
        >
          {brand.labels.adminCourseCreateButton}
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-sk-ink/60">
          {brand.labels.adminCourseTypesEmptyTemplate.replace(
            "{serviceTypePlural}",
            brand.labels.serviceTypePlural
          )}
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((c) => (
            <li
              key={String(c.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-sk-ink/10 px-3 py-2"
            >
              <span>
                {brand.labels.adminCourseTypeRowSummaryTemplate
                  .replace("{name}", String(c.name))
                  .replace("{durationMin}", String(c.durationMin))
                  .replace("{priceCHF}", String(c.priceCHF))}
              </span>
              <button
                type="button"
                className="text-xs text-red-600 underline"
                onClick={async () => {
                  setCourseErr(null);
                  try {
                    await fetchJson(`/api/admin/course-types/${c.id}`, {
                      method: "DELETE",
                    });
                    onChange();
                  } catch (e) {
                    setCourseErr(getUiErrorInfo(e, brand.labels.uiDeleteFailed));
                  }
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
