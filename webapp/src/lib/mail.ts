import { Resend } from "resend";
import { brand, getResendFromEmail } from "@/config/brand";

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
  const L = brand.labels;
  const subject = L.emailBookingRequestSubjectTemplate
    .replace("{bookingRequest}", L.bookingRequestSingular)
    .replace("{siteName}", brand.siteName);
  const bodyLine = L.emailBookingRequestBodyLineTemplate.replace(
    "{serviceSingular}",
    escapeHtml(L.serviceSingular)
  );
  const signoff = L.emailSignoffWithSiteTemplate.replace(
    "{siteName}",
    escapeHtml(brand.siteName)
  );
  await r.emails.send({
    from: from(),
    to,
    subject,
    html: `<p>Hallo ${escapeHtml(guestName)},</p>
<p>${bodyLine}</p>
<p>${signoff}</p>`,
  });
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const L = brand.labels;
  const subject = L.emailAdminNewRequestSubjectTemplate
    .replace("{bookingRequest}", L.bookingRequestSingular)
    .replace("{guestName}", payload.guestName);
  const intro = L.emailAdminNewRequestIntroTemplate.replace(
    "{bookingRequest}",
    escapeHtml(L.bookingRequestSingular)
  );
  const dateTimeLabel = escapeHtml(L.emailAdminNewRequestDateTimeLabel);
  const cta = escapeHtml(L.emailCtaOpenAdmin);
  await r.emails.send({
    from: from(),
    to: adminTo,
    subject,
    html: `<p>${intro}</p>
<ul>
<li>${escapeHtml(L.clientSingular)}: ${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestEmail)})</li>
<li>${escapeHtml(L.serviceSingular)}: ${escapeHtml(payload.courseName)}</li>
<li>${dateTimeLabel} ${escapeHtml(payload.date)} ${escapeHtml(payload.startTime)}</li>
</ul>
<p><a href="${escapeHtml(appUrl)}/admin/anfragen">${cta}</a></p>`,
  });
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
  const L = brand.labels;
  const subject = L.emailBookingConfirmedSubjectTemplate
    .replace("{serviceSingular}", L.serviceSingular)
    .replace("{siteName}", brand.siteName);
  const intro = L.emailBookingConfirmedIntroTemplate.replace(
    "{bookingSingular}",
    escapeHtml(L.bookingSingular)
  );
  const closing = escapeHtml(L.emailBookingConfirmedClosing);
  await r.emails.send({
    from: from(),
    to,
    subject,
    html: `<p>Hallo ${escapeHtml(guestName)},</p>
<p>${intro}</p>
<ul>
<li>${escapeHtml(details.courseName)}</li>
<li>${escapeHtml(details.date)} um ${escapeHtml(details.startTime)}</li>
</ul>
<p>${closing}</p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
