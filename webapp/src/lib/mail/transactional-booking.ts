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

export function guestPortalMagicLinkMail(guestName: string, portalUrl: string) {
  const L = brand.labels;
  const subject = L.emailGuestPortalMagicSubject.replace(
    "{siteName}",
    brand.siteName
  );
  const greet = L.emailGuestPortalMagicGreeting.replace(
    "{name}",
    escapeHtml(guestName)
  );
  const html = `<p>${greet}</p>
<p>${escapeHtml(L.emailGuestPortalMagicIntro)}</p>
<p><a href="${escapeHtml(portalUrl)}">${escapeHtml(L.emailGuestPortalMagicCta)}</a></p>
<p>${escapeHtml(L.emailGuestPortalMagicFooter)}</p>`;
  return { subject, html };
}

export function bookingReminderMail(payload: {
  guestName: string;
  courseName: string;
  date: string;
  startTime: string;
  teacherName: string;
}) {
  const L = brand.labels;
  const subject = L.emailBookingReminderSubject.replace(
    "{siteName}",
    brand.siteName
  );
  const greet = L.emailBookingReminderGreeting.replace(
    "{name}",
    escapeHtml(payload.guestName)
  );
  const html = `<p>${greet}</p>
<p>${escapeHtml(L.emailBookingReminderIntro)}</p>
<ul>
<li>${escapeHtml(L.serviceSingular)}: ${escapeHtml(payload.courseName)}</li>
<li>${escapeHtml(L.calDate)}: ${escapeHtml(payload.date)} · ${escapeHtml(payload.startTime)}</li>
<li>${escapeHtml(L.staffSingular)}: ${escapeHtml(payload.teacherName || "—")}</li>
</ul>
<p>${escapeHtml(L.emailBookingReminderClosing)}</p>`;
  return { subject, html };
}

export function teacherSubstitutionMail(payload: {
  recipientLabel: "old" | "new" | "guest";
  guestName: string;
  courseName: string;
  date: string;
  startTime: string;
  oldTeacher: string;
  newTeacher: string;
}) {
  const L = brand.labels;
  const subject = L.emailTeacherSubstitutionSubject.replace(
    "{siteName}",
    brand.siteName
  );
  const line =
    payload.recipientLabel === "guest"
      ? L.emailTeacherSubstitutionBodyGuest
      : payload.recipientLabel === "old"
        ? L.emailTeacherSubstitutionBodyOld
        : L.emailTeacherSubstitutionBodyNew;
  const signoff = L.emailSignoffWithSiteTemplate.replace(
    "{siteName}",
    escapeHtml(brand.siteName)
  );
  const html = `<p>${escapeHtml(L.emailTeacherSubstitutionIntro)}</p>
<p>${escapeHtml(line)}</p>
<ul>
<li>${escapeHtml(L.clientSingular)}: ${escapeHtml(payload.guestName)}</li>
<li>${escapeHtml(L.serviceSingular)}: ${escapeHtml(payload.courseName)}</li>
<li>${escapeHtml(L.calDate)}: ${escapeHtml(payload.date)} · ${escapeHtml(payload.startTime)}</li>
<li>${escapeHtml(L.emailTeacherSubstitutionWas)} ${escapeHtml(payload.oldTeacher)}</li>
<li>${escapeHtml(L.emailTeacherSubstitutionNow)} ${escapeHtml(payload.newTeacher)}</li>
</ul>
<p>${signoff}</p>`;
  return { subject, html };
}
