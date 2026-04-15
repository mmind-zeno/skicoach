import { Resend } from "resend";
import { brand, getResendFromEmail } from "@/config/brand";
import {
  adminNewRequestMail,
  bookingConfirmedMail,
  bookingReminderMail,
  bookingRequestConfirmationMail,
  escapeHtml,
  guestPortalMagicLinkMail,
  teacherSubstitutionMail,
} from "@/lib/mail/transactional-booking";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = () => getResendFromEmail();

export async function sendBookingRequestConfirmation(
  to: string,
  guestName: string
): Promise<void> {
  const r = client();
  if (!r) return;
  const { subject, html } = bookingRequestConfirmationMail(guestName);
  await r.emails.send({ from: from(), to, subject, html });
}

export async function sendAdminNewRequest(payload: {
  guestName: string;
  guestEmail: string;
  courseName: string;
  date: string;
  startTime: string;
  requestId: string;
}): Promise<void> {
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
  const r = client();
  if (!r || !adminTo) return;
  const { subject, html } = adminNewRequestMail(payload);
  await r.emails.send({ from: from(), to: adminTo, subject, html });
}

export async function sendTeacherInviteMagicLinkEmail(
  to: string,
  displayName: string,
  magicLinkUrl: string,
  loginPageUrl: string
): Promise<void> {
  const r = client();
  if (!r) {
    throw new Error(brand.labels.configResendApiKeyMissing);
  }
  const L = brand.labels;
  const subject = L.emailInviteSubjectTemplate.replace(
    "{siteName}",
    brand.siteName
  );
  const greeting = L.emailInviteGreetingTemplate.replace(
    "{name}",
    escapeHtml(displayName)
  );
  const bodyIntro = L.emailInviteBodyIntroTemplate
    .replace("{staffRole}", escapeHtml(L.staffRoleInInvite))
    .replace("{siteName}", escapeHtml(brand.siteName));
  const ctaLabel = L.emailInviteCtaSignInTemplate.replace(
    "{siteName}",
    escapeHtml(brand.siteName)
  );
  const fallback = L.emailInviteLoginFallbackLineTemplate.replace(
    "{loginUrl}",
    escapeHtml(loginPageUrl)
  );
  const signoff = L.emailSignoffWithSiteTemplate.replace(
    "{siteName}",
    escapeHtml(brand.siteName)
  );
  await r.emails.send({
    from: from(),
    to,
    subject,
    html: `<p>${greeting}</p>
<p>${bodyIntro}</p>
<p><a href="${escapeHtml(magicLinkUrl)}">${ctaLabel}</a></p>
<p>${fallback}</p>
<p>${signoff}</p>`,
  });
}

export async function sendBookingConfirmed(
  to: string,
  guestName: string,
  details: { date: string; startTime: string; courseName: string }
): Promise<void> {
  const r = client();
  if (!r) return;
  const { subject, html } = bookingConfirmedMail(guestName, details);
  await r.emails.send({ from: from(), to, subject, html });
}

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    ""
  );
}

export async function sendGuestPortalMagicLink(
  to: string,
  guestName: string,
  token: string
): Promise<void> {
  const r = client();
  if (!r) return;
  const base = appOrigin();
  if (!base) return;
  const portalUrl = `${base}/buchen/meine-termine?token=${encodeURIComponent(token)}`;
  const { subject, html } = guestPortalMagicLinkMail(guestName, portalUrl);
  await r.emails.send({ from: from(), to, subject, html });
}

async function postReminderSmsWebhook(to: string, text: string): Promise<void> {
  const url = process.env.REMINDER_SMS_WEBHOOK_URL?.trim();
  if (!url || !to) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, text }),
  });
}

export async function sendBookingReminderNotification(payload: {
  to: string;
  guestName: string;
  courseName: string;
  date: string;
  startTime: string;
  teacherName: string;
  guestPhone: string | null;
}): Promise<void> {
  const r = client();
  if (r) {
    const { subject, html } = bookingReminderMail({
      guestName: payload.guestName,
      courseName: payload.courseName,
      date: payload.date,
      startTime: payload.startTime,
      teacherName: payload.teacherName,
    });
    await r.emails.send({ from: from(), to: payload.to, subject, html });
  }
  const smsLine = `${payload.courseName} ${payload.date} ${payload.startTime}`.trim();
  if (payload.guestPhone) {
    await postReminderSmsWebhook(
      payload.guestPhone,
      `${brand.labels.emailBookingReminderSubject.replace("{siteName}", brand.siteName)}: ${smsLine}`
    );
  }
}

export async function sendTeacherSubstitutionNotifications(payload: {
  guestEmail: string | null;
  guestName: string;
  oldTeacherEmail: string | null;
  oldTeacherName: string;
  newTeacherEmail: string | null;
  newTeacherName: string;
  courseName: string;
  date: string;
  startTime: string;
}): Promise<void> {
  const r = client();
  if (!r) return;
  const send = async (
    to: string,
    label: "old" | "new" | "guest"
  ): Promise<void> => {
    const { subject, html } = teacherSubstitutionMail({
      recipientLabel: label,
      guestName: payload.guestName,
      courseName: payload.courseName,
      date: payload.date,
      startTime: payload.startTime,
      oldTeacher: payload.oldTeacherName,
      newTeacher: payload.newTeacherName,
    });
    await r.emails.send({ from: from(), to, subject, html });
  };
  if (payload.guestEmail?.trim()) {
    await send(payload.guestEmail.trim(), "guest");
  }
  if (
    payload.oldTeacherEmail?.trim() &&
    payload.oldTeacherEmail !== payload.newTeacherEmail
  ) {
    await send(payload.oldTeacherEmail.trim(), "old");
  }
  if (payload.newTeacherEmail?.trim()) {
    await send(payload.newTeacherEmail.trim(), "new");
  }
}

export { escapeHtml } from "@/lib/mail/transactional-booking";
