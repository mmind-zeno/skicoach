import { Resend } from "resend";
import { brand, getResendFromEmail } from "@/config/brand";
import {
  adminNewRequestMail,
  bookingConfirmedMail,
  bookingRequestConfirmationMail,
  escapeHtml,
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

export { escapeHtml } from "@/lib/mail/transactional-booking";
