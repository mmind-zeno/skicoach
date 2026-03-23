/**
 * Zentrale Marken- und Produktkonfiguration für „ein Deployment pro Branche“.
 *
 * Bei einem Fork: primär `FORK_DEFAULTS` anpassen. Optional überschreiben per
 * NEXT_PUBLIC_* zur Build-/Deploy-Zeit (siehe Repo-Root `.env.example` und FORKING.md).
 */

const FORK_DEFAULTS = {
  siteName: "skicoach",
  siteDomain: "skicoach.li",
  supportEmail: "info@skicoach.li",
  /** Kurzbeschreibung für <meta name="description"> und Startseite */
  marketingTagline:
    "Skischule — interne Verwaltung & Buchungsportal",
  /** Fließtext unter der Überschrift auf der Startseite */
  homeLead:
    "Buchungsportal und Team-Workspace der Skischule. Kursanfragen laufen ueber das oeffentliche Portal, interne Planung ueber Kalender und Admin-Bereich.",
  htmlLang: "de" as const,
  /** Rechnungs-PDF / Impressum-Zeile */
  issuerLocation: "Liechtenstein",
  /** Monitoring: JSON-Feld `service` im Health-Endpoint */
  serviceSlug: "skicoach-webapp",
  /** Fallback Absender, wenn RESEND_FROM_EMAIL nicht gesetzt (sollte zur Domain passen) */
  defaultResendFrom: "noreply@skicoach.li",
  /** NextAuth Resend-Provider: lokaler Fallback ohne verifizierte Domain */
  authResendFallback: "skicoach@localhost",
  labels: {
    staffSingular: "Lehrkraft",
    staffPlural: "Lehrkräfte",
    /** Kollektivbegriff für Listen/Checkboxen, z. B. „Alle Lehrer“, „Lehrerliste“ */
    staffCollectivePlural: "Lehrer",
    staffRoleInInvite: "Lehrkraft",
    clientSingular: "Gast",
    clientPlural: "Gäste",
    serviceSingular: "Kurs",
    servicePlural: "Kurse",
    bookingSingular: "Buchung",
    bookingPlural: "Buchungen",
    /** Admin / Modal: „Kurstyp“ vs. z. B. „Angebotsart“ */
    serviceTypeSingular: "Kurstyp",
    serviceTypePlural: "Kurstypen",
    requestServiceCta: "Kurs anfragen",
    teamLoginNav: "Login (Team)",
    teamLoginHome: "Team-Login",
    teamAreaTitle: "Team-Bereich",
    /** Kalender-Detail / Storno: „Termin“ */
    appointmentSingular: "Termin",
    appointmentPlural: "Termine",
    /** Öffentliches Portal → Admin */
    bookingRequestSingular: "Buchungsanfrage",
    bookingRequestPlural: "Buchungsanfragen",
    /**
     * Kurzform für UI (Sidebar, Wizard-Buttons, Toasts).
     * Formal länger: `bookingRequestSingular`.
     */
    requestSingular: "Anfrage",
    requestPlural: "Anfragen",
    invoiceSingular: "Rechnung",
    invoicePlural: "Rechnungen",
    /** Interne App: Sidebar & Seitentitel */
    navCalendar: "Kalender",
    navInvoices: "Rechnungen",
    navChat: "Chat",
    navAdmin: "Admin",
    navAudit: "Audit",
    navAuditLog: "Audit-Protokoll",
    navTeam: "Team",
    navHome: "Start",
    navContact: "Kontakt",
    navPrivacy: "Datenschutz",
    /** Gäste-CRM: Filter nach Fähigkeitsstufe (Ski) — Fork z. B. „Level“ */
    clientSkillFilterLabel: "Niveau",
    /** Chat-Sidebar */
    chatChannelsHeading: "Kanäle",
    chatDirectHeading: "Direkt",
    chatConnectionLive: "Live (Socket.io)",
    chatConnectionPolling: "Polling",
    navDashboard: "Dashboard",
    /** react-big-calendar (deutsche Toolbar) */
    calNext: "Weiter",
    calPrevious: "Zurück",
    calToday: "Heute",
    calMonth: "Monat",
    calWeek: "Woche",
    calDay: "Tag",
    calAgenda: "Agenda",
    calDate: "Datum",
    calTime: "Zeit",
    calShowMoreSuffix: "mehr",
    /** StatusBadge & Tabellen */
    statusGeplant: "Geplant",
    statusDurchgefuehrt: "Durchgeführt",
    statusStorniert: "Storniert",
    statusOffen: "Offen",
    statusBezahlt: "Bezahlt",
    statusAnfrageNeu: "Neu",
    statusAnfrageBestaetigt: "Bestätigt",
    statusAnfrageAbgelehnt: "Abgelehnt",
    /** Kurz-UI (Buttons, Fallbacks) */
    uiErrorGeneric: "Fehler",
    uiSave: "Speichern",
    uiSaveInProgress: "Speichern…",
    uiSaveFailed: "Speichern fehlgeschlagen",
    uiDeleteFailed: "Löschen fehlgeschlagen",
    uiStatusUpdateFailed: "Status konnte nicht gesetzt werden",
    uiNameRequired: "Name erforderlich",
    uiValidationNameAndEmail: "Name und gültige E-Mail erforderlich.",
    placeholderClientSearch: "Name oder E-Mail…",
    /** z. B. Buchungs-Modal: Suchfeld mit Verb */
    placeholderClientSearchModal: "Suche Name oder E-Mail…",
    placeholderEmail: "E-Mail",
    placeholderPhoneOptional: "Telefon (optional)",
    uiCancel: "Abbrechen",
    uiEdit: "Bearbeiten",
    uiClose: "Schließen",
    uiDelete: "Löschen",
    uiContactTextRequired: "Text erforderlich",
    /** Buchungs-Detail: Feldüberschriften & schnelle Status-Buttons */
    fieldPrice: "Preis",
    fieldStatus: "Status",
    fieldSource: "Herkunft",
    fieldNotes: "Notizen",
    bookingActionStornieren: "Stornieren",
    /** API / Services: von Clients angezeigte Fehlermeldungen */
    apiChatChannelOrRecipientRequired:
      "channelId oder recipientId erforderlich",
    apiChatEmptyMessage: "Leere Nachricht",
    apiAdminTeacherIdMissing: "teacherId fehlt",
    /** Admin: neuer Kurstyp */
    adminCoursePlaceholderName: "Name",
    adminCoursePlaceholderDurationMin: "Dauer Min",
    adminCoursePlaceholderPriceChf: "Preis CHF",
    adminCoursePlaceholderMaxParticipants: "Max TN",
    adminCoursePublicPortalLabel: "Öffentlich (Portal)",
    adminCourseCreateButton: "Anlegen",
    /** Chat: Fehlermeldungen (Service/API) & Composer */
    chatChannelNotFound: "Kanal nicht gefunden",
    chatDmNotAvailable: "Gespräch nicht verfügbar",
    /** `{max}` wird durch Zeichenlimit ersetzt */
    chatMessageTooLongTemplate: "Nachricht zu lang (max. {max} Zeichen)",
    chatDmSelfForbidden: "Keine Direktnachricht an dich selbst",
    chatRecipientUnavailable: "Empfänger nicht verfügbar",
    chatChannelCreateFailed: "Kanal konnte nicht erstellt werden",
    chatMessageSendFailed: "Nachricht konnte nicht gesendet werden",
    chatComposerPlaceholder:
      "Nachricht… (Enter sendet, Shift+Enter Zeile)",
    chatSendButton: "Senden",
    apiChatChannelNameTooShort: "Name zu kurz",
    /** Rechnungsliste & Filter */
    uiFilterAll: "Alle",
    invoiceStatsLoading: "Monatsstatistik wird geladen…",
    invoiceMetricOpenMonth: "Offen (Monat)",
    invoiceMetricPaidMonth: "Bezahlt (Monat)",
    invoiceTableNumberAbbrev: "Nr.",
    invoiceTableDate: "Datum",
    invoiceTableCurrency: "CHF",
    invoiceTableActions: "Aktionen",
    invoicePreview: "Vorschau",
    invoicePdfLink: "PDF",
    invoiceDownloadPdf: "PDF herunterladen",
    invoiceMarkPaidButton: "Als bezahlt markieren",
    /** REST-API: wiederkehrende JSON-Fehler (für Forks / einheitliche Texte) */
    apiInvalidData: "Ungültige Daten",
    apiInvalidEmail: "Ungültige E-Mail",
    apiInviteFailed: "Fehler beim Einladen",
    apiResendInviteFailed: "Versand fehlgeschlagen",
    apiPatchNoFields: "Keine Felder",
    apiNotFound: "Nicht gefunden",
    apiNothingToUpdate: "Nichts zu aktualisieren",
    apiUnauthorized: "Unauthorized",
    apiForbidden: "Forbidden",
    apiBookingListDateRangeRequired:
      "dateFrom und dateTo (YYYY-MM-DD) erforderlich",
    apiAdminInviteRateLimited: "Zu viele Einladungen. Bitte später erneut.",
    apiAdminSelfDeactivateForbidden:
      "Du kannst dich nicht selbst deaktivieren",
    apiTurnstileFailed: "Sicherheitsprüfung fehlgeschlagen",
    apiTooManyRequests: "Too many requests",
    apiPublicSlotsParamsRequired:
      "courseTypeId und date (YYYY-MM-DD) erforderlich",
    apiPublicAvailabilityParamsRequired:
      "courseTypeId und month (YYYY-MM) erforderlich",
    apiAdminUserNotFound: "Nutzer nicht gefunden",
    apiAdminUserExists:
      "Nutzer existiert bereits. Magic-Link erneut senden: in der Tabelle „Link erneut“ nutzen.",
    /** lib/errors: Defaults wenn ohne Message geworfen */
    apiValidationDefault: "Ungültige Eingabe",
    /** DB-/Technik-Hinweise (map-db-error, Gäste-API) */
    apiDbSchemaColumnDrift:
      "Datenbank-Schema ist nicht aktuell. Bitte auf dem Server Migrationen ausführen (npm run db:migrate im App-Container).",
    apiDbSchemaRelationDriftTemplate:
      "Datenbank-Schema ist nicht aktuell. Bitte Migrationen ausführen (z. B. 0001_rate_limit_audit für das {navAuditLog}).",
    apiTechnicalErrorGeneric: "Ein technischer Fehler ist aufgetreten.",
    /** Services: Platzhalter {…} per .replace ersetzen */
    apiGuestContactSaveFailed: "Kontakt konnte nicht gespeichert werden",
    msgTimeSlotUnavailableForStaff:
      "Zeitslot für diesen {staffPlural} nicht verfügbar",
    msgInvalidServiceType: "Ungültiger {serviceTypeSingular}",
    msgStaffUnavailableAtSlot:
      "{staffPlural} zu diesem Zeitpunkt nicht verfügbar",
    msgBookingRequestNoLongerOpen: "{bookingRequest} ist nicht mehr offen",
    msgBookingInsertFailed: "{booking} fehlgeschlagen",
    msgBookingRequestInsertFailed: "{bookingRequest} fehlgeschlagen",
    msgInvoiceInsertFailed: "{invoice} konnte nicht erstellt werden",
    msgInvoiceAlreadyForBooking:
      "Für diese {booking} existiert bereits eine {invoice}",
    msgGuestHasBookingsNoDelete:
      "{client} hat {bookings} und kann nicht gelöscht werden",
    msgEntityNotFound: "{entity} nicht gefunden",
    /** Server-Konfiguration (Magic-Link / Einladungen) */
    configInviteOriginMissing:
      "AUTH_URL, NEXTAUTH_URL oder NEXT_PUBLIC_APP_URL muss gesetzt sein für Einladungs-E-Mails.",
    configAuthSecretMissing: "AUTH_SECRET / NEXTAUTH_SECRET fehlt.",
    apiUserByEmailNotFound: "Nutzer mit dieser E-Mail nicht gefunden",
    apiUserDeactivatedReactivateFirst:
      "Nutzer ist deaktiviert — zuerst wieder aktivieren",
    /** Admin: Nutzerliste & Einladungen */
    adminDashboardLoading: "Dashboard wird geladen…",
    adminUserListLoading: "Nutzerliste wird geladen…",
    adminInviteEmailPlaceholder: "E-Mail einladen",
    uiErrorHttpTemplate: "Fehler ({status})",
    adminSendMagicLink: "Magic-Link senden",
    adminUsersEmptyHint:
      "Noch keine Nutzer. Oben eine E-Mail eintragen und Magic-Link senden.",
    adminMagicLinkResentToast: "Magic-Link wurde erneut gesendet.",
    adminResendMagicLink: "Link erneut",
    adminActivateUser: "Aktivieren",
    adminActivateUserFailed: "Aktivieren fehlgeschlagen",
    adminCannotChangeOwnRoleHere: "Eigene Rolle hier nicht ändern",
    adminRoleChangeFailed: "Rolle konnte nicht geändert werden",
    adminRoleToggle: "Rolle togglen",
    adminConfirmDeactivateUserTemplate:
      "{email} wirklich deaktivieren? Login ist danach nicht mehr möglich.",
    adminDeactivateUserFailed: "Deaktivieren fehlgeschlagen",
    adminDeactivateUser: "Deaktivieren",
    /** Tabellen / Formular-Labels (häufig) */
    labelName: "Name",
    labelEmail: "E-Mail",
    labelRole: "Rolle",
    labelActive: "Aktiv",
    labelSearch: "Suche",
    uiYes: "ja",
    uiNo: "nein",
    /** Tabellen / UI-Kurztexte */
    uiEmDash: "—",
    tableColAction: "Aktion",
    /** Admin: Buchungsanfragen */
    adminRequestConfirm: "Bestätigen",
    adminRequestReject: "Ablehnen",
    placeholderRejectReasonOptional: "Grund (optional)",
    /** Audit-Log (Client + Fehler) */
    auditLogUnauthorized: "Nicht angemeldet — bitte neu anmelden.",
    auditLogForbiddenTemplate: "Keine Berechtigung für das {navAuditLog}.",
    auditLogServerError: "Serverfehler beim Laden des Protokolls.",
    auditLogHttpErrorTemplate: "HTTP {status}",
    auditLogLoadFailedPrefix: "Konnte Protokoll nicht laden:",
    uiLoadingEllipsis: "Lade …",
    uiNoEntriesYet: "Noch keine Einträge.",
    auditColTimeUtc: "Zeit (UTC)",
    auditColAction: "Aktion",
    auditColActor: "Akteur",
    auditColResource: "Ressource",
    auditColIp: "IP",
    auditColDetails: "Details",
    /** Öffentlicher Buchungs-Wizard */
    publicWizardPickDate: "Datum wählen",
    publicWizardTimeAndContact: "Zeit & Kontakt",
    publicWizardSlotsTitle: "Zeitslots",
    publicBookingCourseMetaTemplate:
      "{durationMin} Min · max. {maxParticipants} · CHF {priceCHF}",
    publicAvailFree: "Frei",
    publicAvailPartial: "Teilweise",
    publicAvailFull: "Voll",
    publicApproxEndShort: "Ende ca.",
    calWeekdayMo: "Mo",
    calWeekdayDi: "Di",
    calWeekdayMi: "Mi",
    calWeekdayDo: "Do",
    calWeekdayFr: "Fr",
    calWeekdaySa: "Sa",
    calWeekdaySo: "So",
    placeholderFirstName: "Vorname",
    placeholderLastName: "Nachname",
    placeholderMessageOptional: "Nachricht (optional)",
    publicTurnstileLabel: "Sicherheitsprüfung",
    publicSummaryDateLabel: "Datum",
    publicSummaryPriceLabel: "Preis",
    publicNoPaymentDisclaimer:
      "Keine Zahlung jetzt — wir bestätigen per E-Mail innerhalb von 24h.",
    publicThanksTitleTemplate: "Vielen Dank, {name}!",
    publicThanksIntroTemplate:
      "Ihre {request} wurde erhalten. Sie erhalten in Kürze eine Bestätigung an",
    publicReferenceLabel: "Referenz",
    niveauAnfaenger: "Anfänger",
    niveauFortgeschritten: "Fortgeschritten",
    niveauExperte: "Experte",
    /** Gäste-CRM */
    labelCompany: "Firma",
    labelPhone: "Telefon",
    labelLanguage: "Sprache",
    labelCrmSource: "CRM-Quelle",
    guestCrmSourceLabelExtended:
      "CRM-Quelle (z. B. Website, Empfehlung)",
    guestListTitleSuffix: "liste",
    guestListNewButton: "+ Neu",
    guestListPhoneAbbrev: "Tel.",
    guestListLastBookingPrefix: "Letzte",
    guestListEmptyTemplate:
      "Keine {clients} — Suche anpassen oder neu anlegen.",
    guestActivityHeading: "Aktivität & Kontakte",
    guestContactNewEntryLabel: "Neuer Eintrag",
    placeholderGuestContactBody:
      "Gespräch, Follow-up, interne Notiz …",
    guestContactKindNote: "Notiz",
    guestContactKindCall: "Anruf",
    guestContactKindEmail: "E-Mail",
    guestContactKindMeeting: "Treffen",
    guestContactSaveButton: "Eintrag speichern",
    guestNoBookingsYetTemplate: "Noch keine {bookings}.",
    guestNewAppointmentCalendarTemplate:
      "Neuer {appointment} (Kalender)",
    guestOpenInvoicesAdj: "offene",
    invoicePdfDescription: "Beschreibung",
    invoicePdfAmountChf: "Betrag CHF",
    invoicePdfNet: "Netto",
    invoicePdfVatTemplate: "MwSt. {percent}%",
    invoicePdfTotalChf: "Total CHF",
    invoicePdfPaymentInfo: "Zahlungsinformationen",
    invoicePdfIbanPrefix: "IBAN:",
    /** Team-Login / Magic-Link (`app/login`) */
    loginTitle: "Anmelden",
    loginLeadMagicLink:
      "Magic Link per E-Mail. Nach dem Klick im Postfach bist du eingeloggt.",
    loginDevNoticeStrong: "Ohne E-Mail-Versand (Resend):",
    loginDevNoticeBeforeCmd: "ein Admin kann auf dem Server mit",
    loginDevNoticeAfterCmd:
      "(Container) einen Einmal-Link erzeugen — siehe README.",
    loginErrorConfiguration:
      "Server-Konfiguration unvollständig (z. B. RESEND_API_KEY oder AUTH_SECRET).",
    loginErrorAccessDenied:
      "Zugang verweigert — dieses Konto ist deaktiviert.",
    loginErrorGenericTemplate: "Fehler: {error}",
    loginEmailPlaceholder: "du@beispiel.li",
    loginButtonSendLink: "Link senden",
    loginButtonSending: "Senden …",
    loginMessageSignInFailed:
      "Anmeldung fehlgeschlagen. Bitte E-Mail prüfen oder später erneut versuchen.",
    loginMessageLinkSent:
      "Link wurde gesendet — bitte Postfach prüfen.",
    loginFallbackLoading: "Laden …",
    loginLinkToHome: "Zur Startseite",
    /** `mail.ts` / Einladungs-Versand ohne Resend-Key */
    configResendApiKeyMissing:
      "RESEND_API_KEY fehlt — Magic-Link kann nicht versendet werden.",
    calendarPickAppointmentHintTemplate:
      "{appointment} im Kalender wählen …",
    guestPageSelectClientHintTemplate: "{client} auswählen …",
    bookingModalInvalidSlot: "Ungültiger Zeitslot.",
    bookingModalPickClientOrNewTemplate:
      "Bitte {client} wählen oder neu anlegen.",
    bookingModalPickCourseTypeTemplate: "{courseType} wählen.",
    bookingModalGuestCreateFailedTemplate:
      "{client} konnte nicht angelegt werden.",
    bookingModalNewAppointmentTitleTemplate: "Neuer {appointment}",
    bookingModalQuickGuestMinCharsTemplate:
      "Mindestens 2 Zeichen für neuen {client}.",
    bookingModalClientSelectedTemplate: "{client} ausgewählt.",
    bookingModalQuickCreateGuestTemplate:
      "Neuen {client} mit eingegebenem Namen anlegen",
    publicWizardPickServiceTypeTemplate: "{serviceType} wählen",
    publicWizardSubmitMissingTemplate:
      "Bitte {service}, Datum und Zeit wählen.",
    placeholderCrmSourceExample: "z. B. Website, Empfehlung",
    guestPlaceholderLanguage: "de",
  },
  features: {
    publicBooking: true,
    groupBookings: false,
    stripeCheckout: false,
  },
  /**
   * Desktop-Login linke Spalte: Verlauf + dezente Deko (ohne ski-spezifische Motive).
   * Pro Fork hier Farben anpassen oder NEXT_PUBLIC_LOGIN_HERO_GRADIENT_* setzen.
   */
  loginHero: {
    gradientFrom: "#0c1f3a",
    gradientVia: "#1B4F8A",
    gradientTo: "#4a90c4",
  },
} as const;

function envPublic(key: string): string | undefined {
  const v = process.env[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

const siteName = envPublic("NEXT_PUBLIC_SITE_NAME") ?? FORK_DEFAULTS.siteName;
const siteDomain =
  envPublic("NEXT_PUBLIC_SITE_DOMAIN") ?? FORK_DEFAULTS.siteDomain;
const supportEmail =
  envPublic("NEXT_PUBLIC_SUPPORT_EMAIL") ?? FORK_DEFAULTS.supportEmail;
const marketingTagline =
  envPublic("NEXT_PUBLIC_MARKETING_TAGLINE") ?? FORK_DEFAULTS.marketingTagline;
const homeLead = envPublic("NEXT_PUBLIC_HOME_LEAD") ?? FORK_DEFAULTS.homeLead;
const htmlLangRaw = envPublic("NEXT_PUBLIC_HTML_LANG");
const htmlLang =
  htmlLangRaw === "en" || htmlLangRaw === "de"
    ? htmlLangRaw
    : FORK_DEFAULTS.htmlLang;
const issuerLocation =
  envPublic("NEXT_PUBLIC_ISSUER_LOCATION") ?? FORK_DEFAULTS.issuerLocation;
const serviceSlug =
  envPublic("NEXT_PUBLIC_SERVICE_SLUG") ?? FORK_DEFAULTS.serviceSlug;
const loginHero = {
  gradientFrom:
    envPublic("NEXT_PUBLIC_LOGIN_HERO_GRADIENT_FROM") ??
    FORK_DEFAULTS.loginHero.gradientFrom,
  gradientVia:
    envPublic("NEXT_PUBLIC_LOGIN_HERO_GRADIENT_VIA") ??
    FORK_DEFAULTS.loginHero.gradientVia,
  gradientTo:
    envPublic("NEXT_PUBLIC_LOGIN_HERO_GRADIENT_TO") ??
    FORK_DEFAULTS.loginHero.gradientTo,
};

const labelsBase = FORK_DEFAULTS.labels;
const labels = {
  ...labelsBase,
  teamAreaLead: `${labelsBase.navCalendar}, ${labelsBase.clientPlural}, ${labelsBase.navInvoices} und ${labelsBase.navChat} — sicher per Magic-Link.`,
  sourceFromBookingPortal: `Aus ${labelsBase.bookingRequestSingular} (Portal)`,
};

export const brand = {
  siteName,
  siteDomain,
  supportEmail,
  marketingTagline,
  homeLead,
  htmlLang,
  issuerLocation,
  serviceSlug,
  loginHero,
  labels,
  features: FORK_DEFAULTS.features,
  /** Kopfzeile Rechnungs-PDF (bisher z. B. skicoach.li) */
  invoiceBrandHeader: siteDomain,
  /** Fußzeile Rechnungs-PDF ohne Rechnungsnummer-Anteil */
  invoiceFooterBase: `${siteDomain} · ${issuerLocation}`,
} as const;

export type Brand = typeof brand;

/** Resend „from“ für Transaktionsmails (mail.ts) */
export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || FORK_DEFAULTS.defaultResendFrom;
}

/** NextAuth Resend-Provider „from“ */
export function getAuthResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || FORK_DEFAULTS.authResendFallback
  );
}
