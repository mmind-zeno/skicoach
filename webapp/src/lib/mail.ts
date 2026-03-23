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
  await r.emails.send({
    from: from(),
    to,
    subject: `Wir haben Ihre ${brand.labels.bookingRequestSingular} erhalten — ${brand.siteName}`,
    html: `<p>Hallo ${escapeHtml(guestName)},</p>
<p>vielen Dank für Ihre ${escapeHtml(brand.labels.serviceSingular)}anfrage. Wir melden uns in der Regel innerhalb von 24 Stunden.</p>
<p>Freundliche Grüsse<br/>${escapeHtml(brand.siteName)}</p>`,
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
  await r.emails.send({
    from: from(),
    to: adminTo,
    subject: `Neue ${brand.labels.bookingRequestSingular}: ${payload.guestName}`,
    html: `<p>Neue ${escapeHtml(brand.labels.bookingRequestSingular)} im Portal.</p>
<ul>
<li>${escapeHtml(brand.labels.clientSingular)}: ${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestEmail)})</li>
<li>${escapeHtml(brand.labels.serviceSingular)}: ${escapeHtml(payload.courseName)}</li>
<li>Datum/Zeit: ${escapeHtml(payload.date)} ${escapeHtml(payload.startTime)}</li>
</ul>
<p><a href="${escapeHtml(appUrl)}/admin/anfragen">Im Admin öffnen</a></p>`,
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
  await r.emails.send({
    from: from(),
    to,
    subject: `Einladung zu ${brand.siteName} — Anmeldung`,
    html: `<p>Hallo ${escapeHtml(displayName)},</p>
<p>du wurdest als ${escapeHtml(brand.labels.staffRoleInInvite)} für ${escapeHtml(brand.siteName)} eingeladen. Mit dem folgenden Link meldest du dich an (einmal gültig, ca. 24&nbsp;Stunden):</p>
<p><a href="${escapeHtml(magicLinkUrl)}">Bei ${escapeHtml(brand.siteName)} anmelden</a></p>
<p>Falls der Link abläuft, fordere auf der <a href="${escapeHtml(
      loginPageUrl
    )}">Login-Seite</a> mit derselben E-Mail-Adresse einen neuen Magic-Link an.</p>
<p>Freundliche Grüsse<br/>${escapeHtml(brand.siteName)}</p>`,
  });
}

export async function sendBookingConfirmed(
  to: string,
  guestName: string,
  details: { date: string; startTime: string; courseName: string }
): Promise<void> {
  const r = client();
  if (!r) return;
  await r.emails.send({
    from: from(),
    to,
    subject: `Ihr ${brand.labels.serviceSingular} ist bestätigt — ${brand.siteName}`,
    html: `<p>Hallo ${escapeHtml(guestName)},</p>
<p>Ihre ${escapeHtml(brand.labels.bookingSingular)} ist bestätigt:</p>
<ul>
<li>${escapeHtml(details.courseName)}</li>
<li>${escapeHtml(details.date)} um ${escapeHtml(details.startTime)}</li>
</ul>
<p>Wir freuen uns auf Sie!</p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
