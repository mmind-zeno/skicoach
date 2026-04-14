import { brand } from "@/config/brand";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bookingRequestConfirmationMail(guestName: string) {
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
  const html = `<p>Hallo ${escapeHtml(guestName)},</p>
<p>${bodyLine}</p>
<p>${signoff}</p>`;
  return { subject, html };
}

export function adminNewRequestMail(payload: {
  guestName: string;
  guestEmail: string;
  courseName: string;
  date: string;
  startTime: string;
  requestId: string;
}) {
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
  const html = `<p>${intro}</p>
<ul>
<li>${escapeHtml(L.clientSingular)}: ${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestEmail)})</li>
<li>${escapeHtml(L.serviceSingular)}: ${escapeHtml(payload.courseName)}</li>
<li>${dateTimeLabel} ${escapeHtml(payload.date)} ${escapeHtml(payload.startTime)}</li>
</ul>
<p><a href="${escapeHtml(appUrl)}/admin/anfragen">${cta}</a></p>`;
  return { subject, html };
}

export function bookingConfirmedMail(
  guestName: string,
  details: { date: string; startTime: string; courseName: string }
) {
  const L = brand.labels;
  const subject = L.emailBookingConfirmedSubjectTemplate
    .replace("{serviceSingular}", L.serviceSingular)
    .replace("{siteName}", brand.siteName);
  const intro = L.emailBookingConfirmedIntroTemplate.replace(
    "{bookingSingular}",
    escapeHtml(L.bookingSingular)
  );
  const closing = escapeHtml(L.emailBookingConfirmedClosing);
  const html = `<p>Hallo ${escapeHtml(guestName)},</p>
<p>${intro}</p>
<ul>
<li>${escapeHtml(details.courseName)}</li>
<li>${escapeHtml(details.date)} um ${escapeHtml(details.startTime)}</li>
</ul>
<p>${closing}</p>`;
  return { subject, html };
}
