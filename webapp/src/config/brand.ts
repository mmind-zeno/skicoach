import {
  BRAND_LABELS_EN,
  DEMO_TEAM_CHANNEL_SEED_MESSAGES_EN,
} from "./brand-labels-en";

/**
 * Zentrale Marken- und Produktkonfiguration für „ein Deployment pro Branche“.
 *
 * Bei einem Fork: primär `FORK_DEFAULTS` anpassen. Optional überschreiben per
 * NEXT_PUBLIC_* zur Build-/Deploy-Zeit (siehe Repo-Root `.env.example` und FORKING.md).
 */

const FORK_DEFAULTS = {
  siteName: "skicoach",
  siteDomain: "skicoach.mmind.space",
  supportEmail: "info@mmind.ai",
  /** Kurzbeschreibung für <meta name="description"> und Startseite */
  marketingTagline:
    "Testprojekt mmind.ai — Buchungsportal & Team-Verwaltung (Demo)",
  /** Fließtext unter der Überschrift auf der Startseite */
  homeLead:
    "Demonstrations-Workspace (Testprojekt mmind.ai): oeffentliches Buchungsportal, Kalender, Gaeste-CRM und Admin — nicht fuer produktiven Schulbetrieb bestimmt.",
  htmlLang: "de" as const,
  /** Rechnungs-PDF / Impressum-Zeile */
  issuerLocation: "Liechtenstein",
  /**
   * Vollständige postalische Anschrift für Datenschutz & Impressum (Fork anpassen).
   * Optional: NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS (eine Zeile; Zeilenumbrüche als \n).
   */
  legalPostalAddress:
    "MMIND GmbH\nDuxgass 55\nFL-9494 Schaan\nFuerstentum Liechtenstein\nTelefon: +4176 458 32 96\nE-Mail: info@mmind.ai\nWeb: https://mmind.ai",
  /** Monitoring: JSON-Feld `service` im Health-Endpoint */
  serviceSlug: "skicoach-webapp",
  /** Fallback Absender, wenn RESEND_FROM_EMAIL nicht gesetzt (sollte zur Domain passen) */
  defaultResendFrom: "noreply@mmind.ai",
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
    navMonthlyHoursReport: "Stundenreport",
    navPayroll: "Lohnabrechnung",
    navChat: "Chat",
    navAdmin: "Admin",
    navAudit: "Audit",
    navAuditLog: "Audit-Protokoll",
    navTeam: "Team",
    /** Interne Sidebar: Session / Abmelden */
    navSignOut: "Abmelden",
    navSessionLoadingEllipsis: "…",
    navHome: "Start",
    navContact: "Kontakt",
    navPrivacy: "Datenschutz",
    navImpressum: "Impressum",
    /** Öffentlicher Bereich: Skip-Link zum Inhalt */
    navSkipToContent: "Zum Inhalt springen",
    /** Öffentliche Site: Desktop-Nav für Screenreader */
    publicMainNavAria: "Hauptnavigation",
    navGuestAppointments: "Meine Termine",
    /** Gäste-CRM: Filter nach Fähigkeitsstufe (Ski) — Fork z. B. „Level“ */
    clientSkillFilterLabel: "Niveau",
    /** Chat-Sidebar */
    /** Chat-Seite: Abschnitte um <code>server.ts</code> und Live/Polling-Labels */
    chatPageIntroSegment1Template:
      "{navTeam}-Kanäle und Direktnachrichten. Mit laufendem ",
    chatPageIntroSegment2Template: " erscheint oben im Chat ",
    chatPageIntroSegment3Template: "; sonst automatisches ",
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
    internalMobileMenuOpen: "Menü",
    toastSuccessOn: "Erfolgs-Toasts: an",
    toastSuccessOff: "Erfolgs-Toasts: aus",
    toastInfoOn: "Info-Toasts: an",
    toastInfoOff: "Info-Toasts: aus",
    toastSessionQuietOn: "Session stumm: an",
    toastSessionQuietOff: "Session stumm: aus",
    toastSessionQuietBadge: "Session stumm aktiv",
    uiRefresh: "Aktualisieren",
    uiDelete: "Löschen",
    uiContactTextRequired: "Text erforderlich",
    /** Buchungs-Detail: Feldüberschriften & schnelle Status-Buttons */
    fieldPrice: "Preis",
    fieldStatus: "Status",
    fieldSource: "Herkunft",
    fieldNotes: "Notizen",
    fieldPaymentStatus: "Zahlung",
    fieldPaymentExternalRef: "Zahlungs-Referenz",
    bookingPaymentLabelNone: "Nicht erfasst",
    bookingPaymentLabelDeposit: "Anzahlung",
    bookingPaymentLabelPaid: "Bezahlt",
    bookingPaymentLabelRefunded: "Erstattet",
    bookingActionStornieren: "Stornieren",
    /** API / Services: von Clients angezeigte Fehlermeldungen */
    apiChatChannelOrRecipientRequired:
      "channelId oder recipientId erforderlich",
    apiChatEmptyMessage: "Leere Nachricht",
    apiAdminTeacherIdMissing: "teacherId fehlt",
    /** Admin: Anfrage bestätigen — FK / gelöschte Referenz */
    apiConfirmBookingFkViolation:
      "Die Buchung konnte nicht angelegt werden (Daten passen nicht mehr zusammen). Bitte Seite neu laden, Lehrkraft erneut wählen und nochmal versuchen.",
    /** Admin: gewählte Lehrkraft nicht (mehr) zuweisbar */
    apiConfirmTeacherNotAssignable:
      "Die gewählte Lehrkraft ist nicht aktiv oder nicht zugelassen. Bitte „Aktualisieren“ in der Lehrerliste und erneut wählen.",
    apiAdminCourseTypeDeleteBlockedTemplate:
      "{serviceTypeSingular} ist noch mit {bookingPlural} oder {bookingRequestPlural} verknüpft und kann nicht gelöscht werden.",
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
    chatEmptyConversationHint:
      "Noch keine Nachrichten in diesem Gespräch.",
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
    invoiceMarkedPaidToastTemplate: "{invoice} als bezahlt markiert.",
    /** REST-API: wiederkehrende JSON-Fehler (für Forks / einheitliche Texte) */
    apiInvalidData: "Ungültige Daten",
    apiInvalidEmail: "Ungültige E-Mail",
    apiInviteFailed: "Fehler beim Einladen",
    apiResendInviteFailed: "Versand fehlgeschlagen",
    apiPatchNoFields: "Keine Felder",
    apiNotFound: "Nicht gefunden",
    apiNothingToUpdate: "Nichts zu aktualisieren",
    apiUnauthorized: "Nicht angemeldet.",
    apiForbidden: "Keine Berechtigung.",
    apiBookingListDateRangeRequired:
      "dateFrom und dateTo (YYYY-MM-DD) erforderlich",
    apiAdminInviteRateLimited: "Zu viele Einladungen. Bitte später erneut.",
    apiAdminSelfDeactivateForbidden:
      "Du kannst dich nicht selbst deaktivieren",
    apiTurnstileFailed: "Sicherheitsprüfung fehlgeschlagen",
    apiTooManyRequests:
      "Zu viele Anfragen. Bitte später erneut versuchen.",
    apiMaintenanceMode:
      "Das Buchungsportal ist vorübergehend nicht erreichbar. Bitte später erneut versuchen.",
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
      "Datenbank-Schema ist nicht aktuell. Bitte auf dem Server Migrationen ausführen (npm run db:migrate:apply im App-Container).",
    apiDbSchemaRelationDriftTemplate:
      "Datenbank-Schema ist nicht aktuell. Bitte Migrationen ausführen (z. B. 0001_rate_limit_audit für das {navAuditLog}).",
    apiTechnicalErrorGeneric: "Ein technischer Fehler ist aufgetreten.",
    /** Services: Platzhalter {…} per .replace ersetzen */
    apiGuestContactSaveFailed: "Kontakt konnte nicht gespeichert werden",
    msgTimeSlotUnavailableForStaff:
      "Zeitslot für diesen {staffPlural} nicht verfügbar",
    msgInvalidServiceType: "Ungültiger {serviceTypeSingular}",
    msgCourseDurationInvalid:
      "Ungültige Kursdauer — bitte Leistung in den Admin-Einstellungen prüfen.",
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
    /** NextAuth Resend: Rate-Limit (Nutzerhinweis) */
    authSignInRateLimitIp:
      "Zu viele Anmeldeversuche von diesem Netzwerk. Bitte später erneut.",
    authSignInRateLimitEmail:
      "Zu viele Anmeldeversuche für diese E-Mail. Bitte später erneut.",
    /** Admin: Nutzerliste & Einladungen */
    adminDashboardLoading: "Dashboard wird geladen…",
    adminTabStaffUsersTemplate: "{staffCollectivePlural} & Nutzer",
    adminTabWeeklyHours: "Verfügbarkeit",
    adminWeeklyHoursHelp:
      "Ohne Einträge gilt das Standard-Zeitraster des Buchungsportals (07:00–20:00). Sobald Zeilen existieren, sind nur noch Termine innerhalb dieser wöchentlichen Fenster möglich (zusätzlich zu Sperrzeiten und bestehenden Buchungen). Über Mitternacht gehende Fenster werden nicht unterstützt.",
    adminWeeklyHoursStaffLabel: "Person:",
    adminWeeklyHoursAddRow: "Zeile hinzufügen",
    adminWeeklyHoursRemoveRow: "Entfernen",
    adminWeeklyHoursSave: "Speichern",
    adminWeeklyHoursSavedToast: "Arbeitszeiten gespeichert.",
    adminWeeklyHoursSaveFailed: "Arbeitszeiten konnten nicht gespeichert werden.",
    adminWeeklyHoursEmptyHint:
      "Keine wöchentlichen Fenster — es gilt das Standard-Portalraster. Zeile hinzufügen, um feste Arbeitszeiten zu setzen.",
    adminWeeklyHoursInvalidWindow: "Endzeit muss nach der Startzeit liegen.",
    adminVacationSectionTitle: "Ferien / Abwesenheit",
    adminVacationHelp:
      "Ganze Tage ohne Verfügbarkeit (z. B. Ferien). In diesem Zeitraum sind keine Buchungen für diese Person möglich. Im Team-Kalender erscheinen die Tage zusätzlich als markierter Block.",
    adminVacationEmptyHint:
      "Keine Ferien erfasst. Zeile hinzufügen, um Abwesenheiten zu planen.",
    adminVacationAddRow: "Zeitraum hinzufügen",
    adminVacationRemoveRow: "Entfernen",
    adminVacationNotePlaceholder: "Notiz (optional)",
    adminVacationSave: "Ferien speichern",
    adminVacationSavedToast: "Ferien / Abwesenheit gespeichert.",
    adminVacationSaveFailed: "Ferien konnten nicht gespeichert werden.",
    adminVacationInvalidRange: "Enddatum muss am oder nach dem Startdatum liegen.",
    adminVacationSpanTooLong: "Ein Zeitraum darf höchstens 370 Tage umfassen.",
    calendarScheduleLegendTitle: "Arbeitszeiten & Kalender-Legende",
    calendarScheduleWeeklyHoursLabel: "Regelmässige Fenster:",
    calendarLegendAppointments:
      "Termine: farbige Blöcke (Farbe wie in der Lehrkräfte-Legende).",
    calendarLegendVacation: "Ferien / frei",
    calendarLegendBlocked: "Gesperrt (Teil des Tages)",
    adminTabMonthlyReport: "Monatsreport",
    monthlyHoursReportTitle: "Monatsstunden",
    monthlyHoursReportIntro:
      "Produktive Stunden ergeben sich aus Terminen (nicht storniert). Zusätzliche Zeit (Büro, Vorbereitung, Meetings, …) erfassen Sie wie in vielen ERP-Systemen als manuelle Stundenbuchung mit Kategorie.",
    monthlyHoursProductive: "Produktiv (Unterricht)",
    monthlyHoursInternalTotal: "Intern / allgemein",
    monthlyHoursTotalWorked: "Total gearbeitet",
    monthlyHoursBookingsDetail: "Termine im Monat",
    monthlyHoursManualEntries: "Manuelle Stundenbuchungen",
    monthlyHoursAddEntry: "Eintrag speichern",
    monthlyHoursExportCsv: "CSV herunterladen",
    monthlyHoursMonthLabel: "Monat",
    monthlyHoursSelectStaff: "Person",
    monthlyHoursCancelledBookings: "Stornierte Termine (ohne Stunden)",
    monthlyHoursHoursAbbr: "Std.",
    monthlyHoursDate: "Datum",
    monthlyHoursTime: "Zeit",
    monthlyHoursCourse: "Angebot",
    monthlyHoursGuest: "Gast",
    monthlyHoursDuration: "Dauer",
    monthlyHoursCategory: "Kategorie",
    monthlyHoursNote: "Notiz",
    monthlyHoursActions: "Aktion",
    monthlyHoursDelete: "Löschen",
    monthlyHoursSavedToast: "Stundenbuchung gespeichert.",
    monthlyHoursDeletedToast: "Eintrag gelöscht.",
    monthlyHoursLoadError: "Report konnte nicht geladen werden.",
    adminTabPayroll: "Lohn (FL)",
    payrollPageTitle: "Lohnabrechnung (Hilfsrechnung)",
    payrollPageIntro:
      "Vereinfachte Monatsabrechnung nach dem Merkblatt der Regierung FL (Teilzeit, geringe Löhne, 2026). Keine Rechts- oder Steuerberatung — massgeblich sind Gesetz und Amt.",
    payrollMerkblattLinkLabel: "Merkblatt Lohnabrechnung (PDF, Regierung FL)",
    payrollLegalBullets:
      "AHV-IV-FAK: Arbeitgeber melden, Beiträge (AN 5,4 % / AG 7,885 % auf beitragspflichtiges Einkommen). KVG: Arbeitgeberanteil vergüten (Erw. 180.50 / Jugend 90.25 CHF/Monat bei 42 h/Woche im Merkblatt-Beispiel). Quellensteuer: 4 % bei Jahresbrutto bis 40'000 CHF (Merkblatt 7). Unfallversicherung, Lohndeklaration, bm.llv.li-Beschäftigtenmeldung, eLohnausweis — siehe Merkblatt.",
    payrollProfileHeading: "Lohnstamm (Admin)",
    payrollHourlyGrossLabel: "Bruttostundenlohn produktiv (CHF)",
    payrollHourlyInternalLabel: "Bruttostundenlohn intern (CHF, leer = wie produktiv)",
    payrollEstimatedAnnualGrossLabel:
      "Geschätztes Jahresbrutto CHF (optional, für Quellensteuer statt ×12/YTD)",
    payrollWhtBasisLabel: "Basis Jahresbrutto (Steuer)",
    payrollYtdBeforeMonth: "YTD freigegeben (Vormonate)",
    payrollWhtMethodManual: "manuell geschätzt",
    payrollWhtMethodYtd: "YTD freigegeben + dieser Monat",
    payrollWhtMethodTimes12: "12 × Monatsbrutto",
    payrollSnapshotBadge: "Monat freigegeben",
    payrollSnapshotFinalized: "Freigegeben am {date} von {by}.",
    payrollFinalizeMonth: "Monat freigeben (Snapshot)",
    payrollUnlockMonth: "Freigabe aufheben",
    payrollSnapshotSavedToast: "Monatslohn freigegeben.",
    payrollSnapshotDeletedToast: "Freigabe entfernt.",
    payrollSnapshotNoComputation: "Keine Berechnung — Stamm und Stunden prüfen.",
    payrollSnapshotNotFound: "Keine Freigabe für diesen Monat.",
    payrollExportCsv: "CSV Jahres-Export (Freigaben)",
    accountingExportCsv: "CSV Jahres-Export (Buchungen & Rechnungen)",
    accountingExportHint:
      "DateV-ähnliche Spalten für alle Buchungen und Rechnungen des Kalenderjahrs (Konten vom Steuerberater zuordnen).",
    accountingExportYearLabel: "Jahr Export",
    guestPortalPageTitle: "Meine Termine",
    guestPortalPageIntro:
      "E-Mail wie bei der Buchung eingeben — Sie erhalten einen sicheren Link (7 Tage gültig).",
    guestPortalEmailLabel: "E-Mail",
    guestPortalSendLink: "Link senden",
    guestPortalLinkSent: "Wenn es passende Termine gibt, wurde ein Link gesendet.",
    guestPortalLogout: "Abmelden / andere E-Mail",
    guestPortalLoadFailed: "Einträge konnten nicht geladen werden.",
    guestPortalInvalidToken: "Ungültiger oder abgelaufener Zugang.",
    guestPortalRateLimited: "Zu viele Anfragen. Bitte später erneut versuchen.",
    guestPortalAlreadyCancelled: "Dieser Termin ist bereits storniert.",
    guestPortalCancelTooLateTemplate:
      "Stornierung nur bis spätestens {hours} Stunden vor Terminbeginn.",
    guestPortalCancel: "Stornieren",
    guestPortalInvoicePdf: "Rechnung PDF",
    guestPortalColWhen: "Datum / Zeit",
    guestPortalColCourse: "Kurs",
    guestPortalColTeacher: "Lehrkraft",
    guestPortalColStatus: "Status",
    guestPortalEmpty: "Keine Termine gefunden.",
    guestPortalLoadingList: "Termine werden geladen …",
    guestPortalCancelConfirmTitle: "Termin stornieren?",
    guestPortalCancelConfirmBody:
      "Der Termin wird als storniert markiert. Dies können Sie je nach Regelung nicht mehr rückgängig machen.",
    guestPortalCancelConfirmBack: "Abbrechen",
    guestPortalCancelConfirmSubmit: "Ja, stornieren",
    bookingAssignTeacherLabel: "Lehrkraft (Vertretung)",
    emailGuestPortalMagicSubject: "Ihre Termine bei {siteName}",
    emailGuestPortalMagicGreeting: "Hallo {name},",
    emailGuestPortalMagicIntro:
      "hier gelangen Sie zu Ihren gebuchten Terminen, Stornierung und Rechnungen.",
    emailGuestPortalMagicCta: "Zu meinen Terminen",
    emailGuestPortalMagicFooter:
      "Der Link ist 7 Tage gültig. Bei Fragen antworten Sie auf diese E-Mail.",
    emailBookingReminderSubject: "Erinnerung: Termin bei {siteName}",
    emailBookingReminderGreeting: "Hallo {name},",
    emailBookingReminderIntro: "wir erinnern an Ihren Termin:",
    emailBookingReminderClosing: "Wir freuen uns auf Sie.",
    emailTeacherSubstitutionSubject: "Terminänderung (Vertretung) — {siteName}",
    emailTeacherSubstitutionIntro: "Der folgende Termin wurde einer anderen Lehrkraft zugewiesen.",
    emailTeacherSubstitutionBodyGuest: "Ihr Termin hat eine neue Lehrkraft.",
    emailTeacherSubstitutionBodyOld: "Sie sind nicht mehr als Lehrkraft für diesen Termin eingeteilt.",
    emailTeacherSubstitutionBodyNew: "Sie wurden für diesen Termin als Lehrkraft eingeteilt.",
    emailTeacherSubstitutionWas: "Bisher:",
    emailTeacherSubstitutionNow: "Neu:",
    payrollPdfGrossProductive: "Brutto aus produktiven Stunden",
    payrollPdfGrossInternal: "Brutto aus internen Stunden",
    payrollPdfWhtBasis: "Jahresbasis Steuerabzug",
    payrollPdfSnapshotNote: "Stand Freigabe",
    payrollWeeklyHoursKvgLabel: "Wochenstunden für KVG-Beispiel (leer = 42)",
    payrollKvgAgeLabel: "KVG Altersklasse",
    payrollKvgAgeAdult: "Erwachsene",
    payrollKvgAgeYouth: "Jugendliche (16–20)",
    payrollApplyWhtLabel: "Pauschal Steuerabzug 4 % (wenn Jahresbrutto ≤ 40'000)",
    payrollMerkblattAckLabel:
      "Bestätigt: Merkblatt-Kontext geprüft (u. a. Jahreslohn unter CHF 14'700 / keine BVG-Pflicht im Merkblatt)",
    payrollAhvNumberLabel: "AHV-Nr. (optional)",
    payrollNotesLabel: "Interne Notiz",
    payrollSaveProfile: "Stamm speichern",
    payrollProfileSavedToast: "Lohnstamm gespeichert.",
    payrollProfileSaveFailed: "Lohnstamm konnte nicht gespeichert werden.",
    payrollDownloadPdf: "PDF-Abrechnung",
    payrollLoadError: "Lohnabrechnung konnte nicht geladen werden.",
    payrollPdfNoComputation:
      "Keine Berechnung möglich — Bruttostundenlohn im Lohnstamm setzen.",
    payrollPdfTitle: "Lohnabrechnung (Übersicht)",
    payrollPdfNotAdvice: "Unverbindliche Hilfsrechnung — keine Amtspflicht entfallen.",
    payrollPdfSectionHours: "Stunden",
    payrollPdfSectionEmployee: "Arbeitnehmer (Abzüge)",
    payrollPdfSectionEmployer: "Arbeitgeber (Leistungen, Übersicht)",
    payrollRowGross: "Bruttolohn",
    payrollRowEmployeeSocial: "Sozialversicherungen AN (AHV/IV/FAK/ALV)",
    payrollRowWht: "Steuerabzug (Quellensteuer, Merkblatt)",
    payrollWhtNotApplied: "nicht angewendet",
    payrollRowNetApprox: "Auszahlung netto (ca.)",
    payrollRowEmployerSocial: "Sozialversicherungen AG",
    payrollRowKvgEmployerMonth: "Krankenpflege AG-Anteil (Monat, Merkblatt-Beispiel)",
    payrollPdfFooterMerkblatt: "Quelle Sätze / Pflichten",
    payrollPdfFooterObligations:
      "Arbeitgeberpflichten (Meldungen, Abrechnungen) sind unabhängig von dieser Übersicht zu erfüllen.",
    timeLogCategoryBueroVerwaltung: "Büro & Verwaltung",
    timeLogCategoryVorbereitung: "Vorbereitung",
    timeLogCategoryMeeting: "Meetings",
    timeLogCategoryFortbildung: "Fortbildung",
    timeLogCategorySonstiges: "Sonstiges",
    adminMetricBookingsMonthLabelTemplate: "{bookingPlural} (Monat)",
    adminMetricBookingsMonthSub: "Im laufenden Kalendermonat",
    adminMetricRevenueLabel: "Umsatz",
    adminMetricRevenueSub:
      "Summe Preise (nicht storniert), aktueller Monat",
    adminMetricActiveStaffLabelTemplate: "Aktive {staffCollectivePlural}",
    adminMetricGuestsTotalLabelTemplate: "{clientPlural} total",
    adminChartBookingsByMonthTitleTemplate: "{bookingPlural} pro Monat ({year})",
    adminChartRevenueByStaffTitleTemplate:
      "Umsatz pro {staffCollectivePlural} (Monat)",
    adminChartRevenueByStaffHint:
      "Balken relativ zum höchsten Umsatz in der Liste",
    adminStatsTableHeaderChf: "CHF",
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
    adminRequestConfirmedToastTemplate:
      "{bookingRequestSingular} bestätigt und {bookingSingular} erstellt.",
    adminRequestRejectedToastTemplate:
      "{bookingRequestSingular} wurde abgelehnt.",
    adminBookingRequestAssignStaffTitleTemplate: "{staffCollectivePlural} zuweisen",
    adminBookingRequestConfirmCreateTemplate: "{bookingSingular} anlegen",
    adminBookingRequestRejectTitleTemplate: "{bookingRequestSingular} ablehnen",
    adminNoTeachersForRequestConfirmHint:
      "Kein aktiver Lehrer oder Admin geladen. Bitte unter Admin → Nutzer mindestens einen Lehrer einladen oder aktivieren.",
    adminSelectStaffPlaceholder: "— Person wählen —",
    adminNewRequestToastTitleTemplate: "Neue {bookingRequest}",
    adminNewRequestToastBodyTemplate:
      "Es ist mindestens eine neue {requestSingular} eingegangen.",
    adminNewRequestToastCtaTemplate: "Zu den {requestPlural}",
    placeholderRejectReasonOptional: "Grund (optional)",
    /** Audit-Log (Client + Fehler) */
    auditLogUnauthorized: "Nicht angemeldet — bitte neu anmelden.",
    auditLogForbiddenTemplate: "Keine Berechtigung für das {navAuditLog}.",
    auditLogServerError: "Serverfehler beim Laden des Protokolls.",
    auditLogHttpErrorTemplate: "HTTP {status}",
    auditLogLoadFailedPrefix: "Konnte Protokoll nicht laden:",
    uiLoadingEllipsis: "Lade …",
    uiNoEntriesYet: "Noch keine Einträge.",
    /** Interne Seiten: Suspense / Listen */
    navPageLoadingTemplate: "{navTitle} wird geladen…",
    staffCollectiveListLoadingTemplate:
      "{staffCollectivePlural}liste wird geladen…",
    staffListEmptyTemplate:
      "Keine {staffPlural} gefunden. {staffCollectivePlural} per {navAdmin} einladen oder Datenbank prüfen.",
    teacherLegendEmptyTemplate: "Keine aktiven {staffPlural} geladen.",
    adminCourseTypesLoadingTemplate: "{serviceTypePlural} werden geladen…",
    adminCourseTypesEmptyTemplate:
      "Noch keine {serviceTypePlural}. Oben anlegen oder per Seed/Migration füllen.",
    adminCourseTypeCreateFailedTemplate:
      "{serviceTypeSingular} konnte nicht angelegt werden",
    calendarFilterShowAllStaffTemplate: "Alle {staffCollectivePlural} anzeigen",
    calendarFilterTeacherByTemplate: "{staffSingular} filtern",
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
    publicCalNotSelectable: "Nicht wählbar",
    publicApproxEndShort: "Ende ca.",
    calWeekdayMo: "Mo",
    calWeekdayDi: "Di",
    calWeekdayMi: "Mi",
    calWeekdayDo: "Do",
    calWeekdayFr: "Fr",
    calWeekdaySa: "Sa",
    calWeekdaySo: "So",
    calMonthPrevAria: "Vorheriger Monat",
    calMonthNextAria: "Nächster Monat",
    bookingWizardStepperAria: "Buchungsschritte",
    bookingWizardStepStatusTemplate: "Schritt {current} von {total}",
    publicWizardCoursePickGroupAria: "Kurstyp wählen",
    publicWizardNiveauGroupAria: "Niveau wählen",
    placeholderFirstName: "Vorname",
    placeholderLastName: "Nachname",
    placeholderMessageOptional: "Nachricht (optional)",
    publicTurnstileLabel: "Sicherheitsprüfung",
    publicSummaryDateLabel: "Datum",
    publicSummaryPriceLabel: "Preis",
    publicNoPaymentDisclaimer:
      "Keine Zahlung jetzt — wir bestätigen per E-Mail innerhalb von 24h.",
    publicPortalPoliciesHeading: "Storno und Zahlung",
    publicPortalPoliciesCancellationLead:
      "Stornierungen nehmen Sie über «Meine Termine» vor, solange der Termin noch nicht durchgeführt oder bereits storniert ist.",
    publicPortalPoliciesCancellationDeadlineTemplate:
      "Online-Storno ist bis spätestens {hours} Stunden vor vereinbartem Terminbeginn möglich.",
    publicPortalPoliciesPayment:
      "Im Portal erfolgt keine Vorauszahlung. Nach Bestätigung erhalten Sie eine Rechnung; Zahlungsziel und Kontodaten entnehmen Sie der Rechnung bzw. den Angaben Ihrer Bestätigungs-E-Mail.",
    maintenancePageBadge: "Status",
    maintenancePageTitle: "Buchungsportal in Wartung",
    maintenancePageMetaDescription:
      "Das öffentliche Buchungsportal ist vorübergehend nicht verfügbar.",
    maintenancePageBody:
      "Wir führen gerade Arbeiten am System durch oder das Portal ist kurzzeitig eingeschränkt. Bitte versuchen Sie es später erneut oder schreiben Sie uns eine E-Mail.",
    maintenancePageMagicLinkHint:
      "Wenn Sie einen Zugangslink aus einer E-Mail geöffnet haben: Bitte denselben Link nach Ende der Wartung erneut anklicken (der Link in der Adresszeile wird bei Wartung nicht übernommen).",
    homeMaintenanceBannerText:
      "Hinweis: Das Buchungsportal ist vorübergehend in Wartung.",
    homeMaintenanceBannerCta: "Details zur Wartung",
    publicThanksTitleTemplate: "Vielen Dank, {name}!",
    publicThanksIntroTemplate:
      "Ihre {request} wurde erhalten. Sie erhalten in Kürze eine Bestätigung an",
    publicReferenceLabel: "Referenz",
    publicWizardSubmitRequestCtaTemplate: "{requestSingular} senden →",
    publicWizardNewRequestAgainTemplate: "Neue {requestSingular} stellen",
    /** Gäste-Detail: Preis in Buchungsliste */
    guestBookingListPriceTemplate: "{amount} {currency}",
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
    guestContactSavedToast: "Kontakt-Eintrag gespeichert.",
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
    /** Rechnungs-PDF: Adressblöcke */
    invoicePdfIssuerHeading: "Rechnungssteller",
    invoicePdfRecipientHeading: "Rechnungsempfänger",
    invoicePdfMetaDateLabel: "Rechnungsdatum",
    invoicePdfMetaServiceLabel: "Leistung / Termin",
    invoicePdfTablePos: "Pos.",
    invoicePdfThankYou: "Vielen Dank für Ihren Besuch.",
    invoicePdfFooterLegalNote:
      "Zahlbar innert 30 Tagen netto, sofern nicht anders vereinbart.",
    /** Team-Login / Magic-Link (`app/login`) */
    loginMetadataTitleTemplate: "Anmelden · {siteName}",
    loginMetadataDescriptionTemplate: "{teamLoginHome} per Magic-Link",
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
    bookingModalPriceChfOptionalLabel: "Preis (CHF, optional)",
    bookingModalCourseTypeOptionTemplate:
      "{name} ({durationMin} Min, {priceCHF} CHF)",
    bookingModalCourseTypesLoadFailed:
      "Kurstypen konnten nicht geladen werden. Bitte später erneut öffnen.",
    bookingModalGuestSearchFailed:
      "Gästesuche fehlgeschlagen — bitte erneut versuchen.",
    bookingModalGuestPrefetchFailed:
      "Ausgewählter Gast konnte nicht geladen werden.",
    guestCreateModalTitleTemplate: "Neuer {clientSingular}",
    guestCreatedToastTemplate: "{clientSingular} erstellt.",
    bookingCreatedToastTemplate: "{appointmentSingular} erstellt.",
    /** Admin: Kurstyp-Zeile in der Liste */
    adminCourseTypeRowSummaryTemplate:
      "{name} · {durationMin} Min · CHF {priceCHF}",
    /** Kalender-Detail: Bestätigung Löschen / Rechnung */
    bookingConfirmDeleteTemplate: "{appointment} wirklich löschen?",
    invoiceCreatedAlertTemplate:
      "{invoice} erstellt — unter {navInvoices} / PDF.",
    invoiceCreateButtonTemplate: "{invoice} erstellen",
    /** Gäste-Detail: Admin-Löschen */
    guestConfirmDeletePermanentTemplate: "{client} endgültig löschen?",
    publicWizardPickServiceTypeTemplate: "{serviceType} wählen",
    publicWizardSubmitMissingTemplate:
      "Bitte {service}, Datum und Zeit wählen.",
    publicWizardCoursesLoadFailed: "Angebote konnten nicht geladen werden.",
    publicWizardAvailabilityLoadFailed:
      "Verfügbarkeit konnte nicht geladen werden.",
    publicWizardSlotsLoadFailed: "Zeiten konnten nicht geladen werden.",
    placeholderCrmSourceExample: "z. B. Website, Empfehlung",
    guestPlaceholderLanguage: "de",
    /** Transaktions-E-Mails (`mail.ts`) */
    emailBookingRequestSubjectTemplate:
      "Wir haben Ihre {bookingRequest} erhalten — {siteName}",
    emailBookingRequestBodyLineTemplate:
      "vielen Dank für Ihre {serviceSingular}anfrage. Wir melden uns in der Regel innerhalb von 24 Stunden.",
    emailSignoffWithSiteTemplate: "Freundliche Grüsse<br/>{siteName}",
    emailAdminNewRequestSubjectTemplate:
      "Neue {bookingRequest}: {guestName}",
    emailAdminNewRequestIntroTemplate:
      "Neue {bookingRequest} im Portal.",
    emailAdminNewRequestDateTimeLabel: "Datum/Zeit:",
    emailCtaOpenAdmin: "Im Admin öffnen",
    emailInviteSubjectTemplate: "Einladung zu {siteName} — Anmeldung",
    emailInviteGreetingTemplate: "Hallo {name},",
    emailInviteBodyIntroTemplate:
      "du wurdest als {staffRole} für {siteName} eingeladen. Mit dem folgenden Link meldest du dich an (einmal gültig, ca. 24&nbsp;Stunden):",
    emailInviteCtaSignInTemplate: "Bei {siteName} anmelden",
    emailInviteLoginFallbackLineTemplate:
      "Falls der Link abläuft, fordere auf der <a href=\"{loginUrl}\">Login-Seite</a> mit derselben E-Mail-Adresse einen neuen Magic-Link an.",
    emailBookingConfirmedSubjectTemplate:
      "Ihr {serviceSingular} ist bestätigt — {siteName}",
    emailBookingConfirmedIntroTemplate:
      "Ihre {bookingSingular} ist bestätigt:",
    emailBookingConfirmedClosing: "Wir freuen uns auf Sie!",
    /** NextAuth Magic-Link (`auth-email-templates.ts`) */
    emailMagicLinkHeadingTemplate: "Anmeldung bei {host}",
    emailMagicLinkButton: "Anmelden",
    emailMagicLinkDisclaimer:
      "Wenn du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.",
    emailMagicLinkTextIntroTemplate: "Anmeldung bei {host}",
    /** Öffentliche Datenschutz-Seite — Verweis auf mmind.ai (keine vollständige Erklärung hier) */
    legalTestProjectNotice:
      "Hinweis: Diese Anwendung ({siteDomain}) ist ein Test- und Demonstrationsprojekt von MMIND (mmind.ai). Es gibt keinen Anspruch auf Vollständigkeit, Verfügbarkeit oder produktiven Betrieb; Demo-Daten können jederzeit gelöscht werden.",
    privacyMusterDisclaimer:
      "Auf dieser Seite finden Sie keine vollständige Datenschutzerklärung. Massgeblich sind die Angaben von MMIND unter https://mmind.ai/datenschutz — dort sind auch Verantwortliche, Rechtsgrundlagen und Ihre Rechte beschrieben.",
    privacySection1Title: "1. Verweise statt vollständiger Erklärung",
    privacySection1BodyTemplate:
      "Diese Instanz ({siteName}, {siteDomain}) dient ausschliesslich Demonstrationszwecken im Kontext von mmind.ai.\n\nVerantwortliche Stelle und vollständige Datenschutzerklärung:\nMMIND GmbH — https://mmind.ai/datenschutz\n\nKontakt Datenschutz: info@mmind.ai (Betreff „Datenschutz“).\n\nAnschrift MMIND (Auszug):\n{postalAddress}",
    privacySection2Title: "2. Welche Daten können in dieser Demo anfallen?",
    privacySection2BodyTemplate:
      "Im Buchungs- und Team-Demo können z. B. Kontaktdaten, {bookingRequestPlural}, {bookingPlural}, {appointmentPlural}, {clientPlural}-Notizen, Chat-Inhalte sowie technische Protokolle (z. B. IP, Zeitstempel) vorkommen — jeweils nur im Umfang der Demo. Details und Aufbewahrung: siehe https://mmind.ai/datenschutz",
    privacyContactPromptTemplate: "Rückfragen zum Datenschutz (MMIND):",
    privacyHostingNoteBeforeLink: "Organisation und Hosting-Hinweise: ",
    privacyHostingNoteLinkText: "mmind.ai",
    privacyHostingNoteLinkUrl: "https://mmind.ai",
    privacyHostingNoteAfterLink:
      " — vollständige Informationen nur auf der Website von MMIND; diese Subdomain ist ein Testprojekt.",
    /** Öffentliches Impressum — Verweis auf mmind.ai */
    imprintMusterDisclaimer:
      "Kein vollständiges Impressum dieser Subdomain: rechtliche Angaben und Haftungshinweise der MMIND GmbH finden Sie unter https://mmind.ai/impressum . Diese Anwendung ist ein nicht-produktives Testprojekt.",
    imprintSection1Title: "1. Verantwortlich / vollständiges Impressum",
    imprintSection1BodyTemplate:
      "Diese Website ({siteDomain}, Projektname „{siteName}“) ist ein Testprojekt von MMIND.\n\nVollständiges Impressum, Anbieterkennzeichnung und Kontakt:\nhttps://mmind.ai/impressum\n\nMMIND GmbH (Auszug aus dem Impressum von mmind.ai):\n{postalAddress}\n\nAllgemeiner Kontakt: info@mmind.ai",
    imprintSection2Title: "2. Haftung und Disclaimer",
    imprintSection2BodyTemplate:
      "Für Haftungsausschlüsse, Urheberrecht und weitergehende rechtliche Hinweise gilt die Fassung auf https://mmind.ai/impressum .\n\nDiese Demo-Anwendung stellt keine geschäftliche Dienstleistung dar; Inhalte und Funktionen können fehlerhaft oder unvollständig sein.",
    /** Fußzeile öffentlicher Bereich vor dem Hosting-Hinweis */
    publicFooterLegalPrefix: "Hinweis:",
    publicFooterTestProjectLine:
      "Testprojekt mmind.ai — https://mmind.ai · Kein produktiver Betrieb.",
    /** Login: kurzer Hinweis neben Dev-Notice */
    loginTestProjectBrief:
      "Testprojekt mmind.ai (https://mmind.ai) — keine produktive Skischule.",
  },
  features: {
    publicBooking: true,
    groupBookings: false,
    stripeCheckout: false,
  },
  /**
   * Optionale Begriffe pro Branche — werden mit `labels` verschmolzen (Fork: z. B. Therapeut statt Lehrkraft).
   * Schlüssel wie in `labels` (z. B. staffSingular).
   */
  terminology: {} as Record<string, string>,
  /**
   * Desktop-Login linke Spalte: Verlauf + dezente Deko (ohne ski-spezifische Motive).
   * Pro Fork hier Farben anpassen oder NEXT_PUBLIC_LOGIN_HERO_GRADIENT_* setzen.
   */
  loginHero: {
    gradientFrom: "#ab3500",
    gradientVia: "#ff6b35",
    gradientTo: "#305f9b",
  },
  /** Demo-Team-Chat für `npm run db:seed` — Fork anpassbar */
  demoTeamChannelSeedMessages: [
    "Willkommen im Team-Kanal!",
    "Bitte Termine im Kalender pflegen.",
    "Bei Fragen: Admin melden.",
    "Schönes Wochenende!",
    "Reminder: Anfragen unter Admin prüfen.",
  ],
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
/** Mehrzeilig: in .env `\n` als echte Zeilenumbrüche oder `\n` escaped schreiben */
const legalPostalAddress = (() => {
  const raw = envPublic("NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS");
  if (raw) return raw.replace(/\\n/g, "\n");
  return FORK_DEFAULTS.legalPostalAddress;
})();
/**
 * Nur in Node (Build / SSR) erzwingen — nicht im Browser.
 * `NEXT_PUBLIC_*` wird beim Client-Bundle zum Build-Zeitpunkt eingesetzt; auf dem
 * Server können Laufzeit-ENV und Build-ARG auseinanderlaufen. Ein Throw im
 * Client bricht öffentliche Seiten (z. B. /buchen) mit „Application error“ ab,
 * obwohl der Server korrekt rendert.
 */
const legalAddressLooksIncomplete =
  /\[Postalische|eintraegen|FORK_DEFAULTS/i.test(legalPostalAddress);
if (
  process.env.NODE_ENV === "production" &&
  typeof window === "undefined" &&
  legalAddressLooksIncomplete
) {
  throw new Error(
    "Brand config incomplete: set NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS or FORK_DEFAULTS.legalPostalAddress before production deploy."
  );
}
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
const labelsMerged =
  htmlLang === "en"
    ? { ...labelsBase, ...BRAND_LABELS_EN }
    : { ...labelsBase };

const labelsCore = {
  ...labelsMerged,
  ...FORK_DEFAULTS.terminology,
};

const labels = {
  ...labelsCore,
  teamAreaLead:
    htmlLang === "en"
      ? `${labelsCore.navCalendar}, ${labelsCore.clientPlural}, ${labelsCore.navInvoices} and ${labelsCore.navChat} — secure magic link sign-in.`
      : `${labelsCore.navCalendar}, ${labelsCore.clientPlural}, ${labelsCore.navInvoices} und ${labelsCore.navChat} — sicher per Magic-Link.`,
  sourceFromBookingPortal:
    htmlLang === "en"
      ? `From ${labelsCore.bookingRequestSingular} (portal)`
      : `Aus ${labelsCore.bookingRequestSingular} (Portal)`,
};

const demoTeamChannelSeedMessages =
  htmlLang === "en"
    ? [...DEMO_TEAM_CHANNEL_SEED_MESSAGES_EN]
    : [...FORK_DEFAULTS.demoTeamChannelSeedMessages];

export const brand = {
  siteName,
  siteDomain,
  supportEmail,
  marketingTagline,
  homeLead,
  htmlLang,
  /** DB-/Formular-Fallback wenn Sprache leer (passt zu htmlLang) */
  defaultGuestLanguage: htmlLang === "en" ? "en" : "de",
  issuerLocation,
  /** Datenschutz / Impressum — siehe FORKING.md */
  legalPostalAddress,
  serviceSlug,
  loginHero,
  /** Zeilen für `scripts/seed.ts` (Team-Kanal), folgt `htmlLang` */
  demoTeamChannelSeedMessages,
  labels,
  /** Roh-Overrides (bereits in `labels` gemerged); für Fork-Doku / Debugging */
  terminology: FORK_DEFAULTS.terminology,
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
