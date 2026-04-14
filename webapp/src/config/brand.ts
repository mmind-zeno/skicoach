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
  /**
   * Vollständige postalische Anschrift für Datenschutz & Impressum (Fork anpassen).
   * Optional: NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS (eine Zeile; Zeilenumbrüche als \n).
   */
  legalPostalAddress:
    "[Postalische Anschrift: Strasse, PLZ Ort, Land — in FORK_DEFAULTS.legalPostalAddress eintragen]",
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
    /** Interne Sidebar: Session / Abmelden */
    navSignOut: "Abmelden",
    navSessionLoadingEllipsis: "…",
    navHome: "Start",
    navContact: "Kontakt",
    navPrivacy: "Datenschutz",
    navImpressum: "Impressum",
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
    bookingActionStornieren: "Stornieren",
    /** API / Services: von Clients angezeigte Fehlermeldungen */
    apiChatChannelOrRecipientRequired:
      "channelId oder recipientId erforderlich",
    apiChatEmptyMessage: "Leere Nachricht",
    apiAdminTeacherIdMissing: "teacherId fehlt",
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
    /** NextAuth Resend: Rate-Limit (Nutzerhinweis) */
    authSignInRateLimitIp:
      "Zu viele Anmeldeversuche von diesem Netzwerk. Bitte später erneut.",
    authSignInRateLimitEmail:
      "Zu viele Anmeldeversuche für diese E-Mail. Bitte später erneut.",
    /** Admin: Nutzerliste & Einladungen */
    adminDashboardLoading: "Dashboard wird geladen…",
    adminTabStaffUsersTemplate: "{staffCollectivePlural} & Nutzer",
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
    /** Öffentliche Datenschutz-Seite — Muster (keine Rechtsberatung; Fork prüfen lassen) */
    privacyMusterDisclaimer:
      "Muster-Datenschutzerklärung zur Orientierung — keine Rechtsberatung. Passen Sie Text und Angaben an Ihre Organisation an und lassen Sie den Inhalt bei Bedarf rechtlich prüfen.",
    privacySection1Title: "1. Verantwortliche Stelle",
    privacySection1BodyTemplate:
      "Verantwortlich für die Datenbearbeitung im Zusammenhang mit dieser Website:\n\n{siteName}\n{postalAddress}\n{siteDomain}\nE-Mail: {supportEmail}\n\nMarkierung / Bezugsort: {issuerLocation}",
    privacySection2Title: "2. Zwecke der Bearbeitung",
    privacySection2BodyTemplate:
      "Wir bearbeiten personenbezogene Daten zur Bearbeitung von {bookingRequestPlural} und {bookingPlural}, zur internen Planung ({appointmentPlural}, {clientPlural}), für den geschützten Team-Bereich (Anmeldung per E-Mail-Link), für {invoicePlural} sowie zur Erfüllung gesetzlicher Pflichten.",
    privacySection3Title: "3. Rechtsgrundlagen",
    privacySection3BodyTemplate:
      "Vertrag bzw. vorvertragliche Massnahmen (Art. 6 Abs. 1 lit. b DSGVO), soweit Sie Anfragen stellen oder wir Leistungen erbringen. Berechtigtes Interesse an einem sicheren Betrieb der Website und des Team-Bereichs (Art. 6 Abs. 1 lit. f DSGVO). Rechtliche Verpflichtungen, z. B. Aufbewahrung (Art. 6 Abs. 1 lit. c DSGVO). Soweit erforderlich Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).",
    privacySection4Title: "4. Kategorien betroffener Daten",
    privacySection4BodyTemplate:
      "Kontakt- und Stammdaten (z. B. Name, E-Mail, Telefon), Buchungs- und Termindaten, ggf. Notizen im {clientPlural}-Bereich, Inhalte im Team-Chat, technische Daten (z. B. IP-Adresse, Zeitstempel in Server- und Audit-Logs).",
    privacySection5Title: "5. Speicherdauer",
    privacySection5BodyTemplate:
      "Soweit möglich löschen wir Daten, sobald der Zweck entfällt. Gesetzliche Aufbewahrungsfristen (z. B. handels- oder steuerrechtlich) können längere Speicherung erfordern.",
    privacySection6Title: "6. Empfänger und Auftragsverarbeiter",
    privacySection6BodyTemplate:
      "Hosting der Anwendung und Datenbank beim von Ihnen gewählten Anbieter. Versand von Transaktions-E-Mails (z. B. Magic-Link, Benachrichtigungen) über einen E-Mail-Dienst (z. B. Resend). Optional: Bot-Schutz (z. B. Cloudflare Turnstile) im öffentlichen Buchungsformular. Mit Auftragsverarbeitern sind Verträge gem. Art. 28 DSGVO abzuschliessen, soweit erforderlich.",
    privacySection7Title: "7. Ihre Rechte",
    privacySection7BodyTemplate:
      "Sie haben je nach Voraussetzung Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Bearbeitung, Datenübertragbarkeit sowie Widerspruch. Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Kontakt: {supportEmail}.",
    privacyContactPromptTemplate: "Rückfragen zum Datenschutz:",
    privacyHostingNoteBeforeLink:
      "Hinweis: Hosting und/oder Support kann ueber ",
    privacyHostingNoteLinkText: "mmind.ai",
    privacyHostingNoteLinkUrl: "https://mmind.ai",
    privacyHostingNoteAfterLink: " erfolgen.",
    /** Öffentliches Impressum — Muster */
    imprintMusterDisclaimer:
      "Muster-Impressum — keine Rechtsberatung. Tragen Sie alle Pflichtangaben für Ihre Rechtsform und Ihr Land vollständig ein.",
    imprintSection1Title: "Anbieterkennzeichnung",
    imprintSection1BodyTemplate:
      "Anbieter dieser Website:\n\n{siteName}\n{postalAddress}\n{siteDomain}\nE-Mail: {supportEmail}",
    imprintSection2Title: "Vertretung / Register",
    imprintSection2BodyTemplate:
      "Bitte im Fork ergänzen (rechtlich prüfen):\n\n• Namen der vertretungsberechtigten Personen (z. B. Geschäftsführung, Vorstand)\n• Rechtsform und Sitz\n• Registerart und -nummer, falls zutreffend (z. B. Handelsregister, Vereinsregister)\n• Registergericht\n\nNicht zutreffende Punkte entfernen.",
    imprintSection3Title: "Umsatzsteuer",
    imprintSection3BodyTemplate:
      "Umsatzsteuer-Identifikationsnummer gem. § 27a UStG (falls vorhanden): _______________________________\n\nWenn keine UID ausgewiesen wird oder keine Umsatzsteuerpflicht besteht: Absatz anpassen oder entfernen (rechtlich prüfen).",
    imprintSection4Title: "Inhaltliche Verantwortung",
    imprintSection4BodyTemplate:
      "Angaben je nach Medium und Staat unterschiedlich. Üblich: Name und ladungsfähige Anschrift der für den redaktionellen Inhalt verantwortlichen Person.\n\nIm Fork ergänzen, z. B.: [Vor- und Nachname], [Strasse Nr., PLZ Ort, Land].",
    imprintSection5Title: "Online-Streitbeilegung",
    imprintSection5BodyTemplate:
      "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen — anpassen, falls bei Ihnen zutreffend.",
    /** Fußzeile öffentlicher Bereich vor dem Hosting-Hinweis */
    publicFooterLegalPrefix: "Hinweis:",
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
if (
  process.env.NODE_ENV === "production" &&
  typeof window === "undefined" &&
  legalPostalAddress === FORK_DEFAULTS.legalPostalAddress
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

const labels = {
  ...labelsMerged,
  teamAreaLead:
    htmlLang === "en"
      ? `${labelsMerged.navCalendar}, ${labelsMerged.clientPlural}, ${labelsMerged.navInvoices} and ${labelsMerged.navChat} — secure magic link sign-in.`
      : `${labelsMerged.navCalendar}, ${labelsMerged.clientPlural}, ${labelsMerged.navInvoices} und ${labelsMerged.navChat} — sicher per Magic-Link.`,
  sourceFromBookingPortal:
    htmlLang === "en"
      ? `From ${labelsMerged.bookingRequestSingular} (portal)`
      : `Aus ${labelsMerged.bookingRequestSingular} (Portal)`,
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
