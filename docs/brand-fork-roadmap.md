# Brand / Fork – Roadmap & Status

Zentrale Konfiguration: `webapp/src/config/brand.ts` · Anleitung: `FORKING.md` · Env: `.env.example`.

## Erledigt (Stand laufende Umsetzung)

- Login-Seite: Texte über `brand.labels.login*`
- `mail.ts`: Fehler bei fehlendem Resend-Key über `brand`; Betreff/Fließtext/CTAs über `email*`-Templates
- `auth-email-templates.ts`: Magic-Link-Überschrift, Button, Disclaimer, Plaintext über `emailMagicLink*`
- REST-JSON: `apiUnauthorized`, `apiForbidden`, `apiTooManyRequests` auf Deutsch
- Chat-Composer-Placeholder: `chatComposerPlaceholder`
- Admin-New-Request-Toast: Schließen → `uiClose`
- Gäste: CRM-Placeholder, Auswahl-Hinweis, Kalender-Hinweis
- Buchungsmodal: Warn- und Titeltexte über Templates
- Öffentlicher Wizard: Schritt-1-Überschrift + Validierungstext als Template
- Gäste-Detail: Buchungsstatus als `StatusBadge`, Sprache-Placeholder, Kontakt-Textarea-Placeholder vereinheitlicht
- Dev-Scripts: `seed.ts` / `issue-admin-login.ts` — Demo-E-Mails über `SEED_EMAIL_DOMAIN` / `NEXT_PUBLIC_SITE_DOMAIN` (optional `SEED_ADMIN_EMAIL`); `drizzle.config.ts` mit `DRIZZLE_DATABASE_URL`/`DB_NAME`-Fallback
- **i18n-Basis:** `webapp/src/lib/locale.ts` — bei `NEXT_PUBLIC_HTML_LANG=en` nutzen Kalender (`react-big-calendar`), öffentlicher Wizard-Monat, Chat-/Gäste-Zeitstempel, Rechnungs-PDF-Datum `enUS` / `en-GB` / `en`; sonst wie bisher DE. `brand.defaultGuestLanguage` und `guestPlaceholderLanguage` folgen `htmlLang`.
- **Datenschutz / Impressum:** Strukturierte Mustertexte (`privacyMusterDisclaimer`, `privacySection1–7*`, `privacyContactPromptTemplate`, `imprintMusterDisclaimer`, `imprintSection1–5*`) + Hosting-Hinweis (`privacyHostingNote*`). Postalische Anschrift: `FORK_DEFAULTS.legalPostalAddress` bzw. `NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS` (`\n` → Zeilenumbruch).
- **Impressum:** Route `/impressum`; öffentliche Middleware; Footer-Hosting-Zeile aus `publicFooterLegalPrefix` + `privacyHostingNote*`.
- **Startseite & Public-Header:** Footer wie Public-Layout (Impressum + Hosting-Hinweis aus Labels); Header-Links Datenschutz / Impressum.
- **Interne Sidebar:** „Rechnungen“ / „Chat“ über `navInvoices` / `navChat`.
- **CHF-Anzeige:** `currencyFormatLocale` in `locale.ts`, genutzt von `CHFAmount`.
- **EN-UI:** `NEXT_PUBLIC_HTML_LANG=en` → Merge von `config/brand-labels-en.ts` (ergänzbares Overlay), inkl. Datenschutz-/Impressum-Muster.
- **Admin-Toast (neue Anfrage):** Texte über `adminNewRequestToast*` in `brand.labels`.
- **Technik:** `BookingWizard` nutzt `appDateFnsLocale` aus `locale.ts`; öffentliche Turnstile-Zeile über `publicTurnstileLabel`. `NotFoundError` / `ValidationError` / `UnauthorizedError` / `ForbiddenError` akzeptieren beliebige Meldungen (`tsc`-clean mit dynamischen `brand.labels`-Strings). Admin-Dashboard-Metriken/Charts & Kurstyp-Löschkonflikt (409) über `brand.labels` inkl. EN.
- **Weitere i18n:** Admin-Dashboard-KPIs (wieder voll angebunden), Kurstyp-Zeilen, Gäste-Modal/-Tabelle, Buchungsmodal (Preis, Notizen, Quick-Gast, Fehlertext, Kurstyp-`<option>`), Buchungsanfragen-Admin (Modale), Chat-Intro-Segmente, öffentlicher Wizard (Senden/„neue Anfrage“), Gäste-Buchungszeile & Niveau-Labels, Rechnungs-PDF-Tabellenköpfe, `msgStaffUnavailableAtSlot` bei Anfragen-Bestätigung.
- **UI/CLI:** Sidebar `UserAvatar` (Abmelden, Lade-Punkte), Kalender „{staff} filtern“, leerer Chat-Thread-Hinweis; Dev-Scripts `test-db.ts`, `issue-admin-login.ts`, Seed-`hint` mit englischen Konsolen-Texten.

## Noch sinnvoll (mittlere / niedrige Priorität)

| Bereich | Was |
|--------|-----|
| **Datenschutz / Impressum** | Mustertexte durch **vom Anwalt freigegebene** Fassung ersetzen (Fork-spezifisch) |
| **i18n** | Weitere seltene UI-Strings bei Bedarf — Kalender/Admin/Audit/Auth-Rate-Limit/Seed-Chat folgen `brand` bzw. `brand.labels` |

**Scripts / Infra:** siehe `.env.example` · Demo-Chat-Saat: `FORK_DEFAULTS.demoTeamChannelSeedMessages` / `brand.demoTeamChannelSeedMessages`.

## Umsetzungsreihenfolge (Empfehlung)

1. Produktivtexte & Rechtliches vor Go-Live  
2. Vollständige Mehrsprachigkeit nur wenn nötig  
