# Fork & neue Branche (ein Deployment pro Vertical)

Dieses Repository ist als **Referenz-Implementierung** gedacht: **skicoach** bleibt das vollständige Projekt; für andere Bereiche (z. B. Massage, Yoga, Tennis) legst du ein **neues Repo** an (Kopie/Fork) und passt Konfiguration, Texte und Branding an — ohne Multi-Tenant-Logik in einer Instanz.

## 1. Zentrale Anpassung: `webapp/src/config/brand.ts`

Datei **`FORK_DEFAULTS`** bearbeiten:

| Feld | Zweck |
|------|--------|
| `siteName` | Produktname in UI, E-Mails, `<title>` |
| `siteDomain` | Domain für Texte/PDF (ohne `https://`) |
| `supportEmail` | Kontakt-Mail, Footer, Datenschutz-Platzhalter |
| `marketingTagline` | Meta-Description |
| `homeLead` | Absatz auf der Startseite |
| `htmlLang` | `de` oder `en` (`<html lang>`) |
| `issuerLocation` | Ort auf der Rechnung (z. B. Land) |
| `legalPostalAddress` | Vollständige postalische Anschrift für Datenschutz & Impressum (oder `NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS`, Zeilenumbrüche als `\n`) |
| `serviceSlug` | Wert von `service` im JSON von `/api/public/health` |
| `defaultResendFrom` / `authResendFallback` | Resend-Absender-Fallbacks (siehe unten) |
| `labels.*` | u. a. `client*`, `service*`, `serviceType*`, `staff*`, `appointment*`, `booking*`, `invoice*`, `bookingRequest*`, `request*`, `nav*` (inkl. `navDashboard`, `navHome`, `navContact`, `navPrivacy`), `clientSkillFilterLabel`, `chatChannelsHeading`, `chatDirectHeading`, `chatConnectionLive`/`chatConnectionPolling`, Kalender-Toolbar (`cal*`), Status-Badges (`status*`), Kurz-UI (`ui*`, z. B. Speichern/Fehler/Löschen), Platzhalter (`placeholder*`), REST-Fehlertexte (`api*`, u. a. `apiUnauthorized`/`apiForbidden`), Team-Login (`login*`), Kalender-Hinweis (`calendarPickAppointmentHintTemplate`), Buchungsmodal (`bookingModal*`), öffentlicher Wizard (`publicWizard*`), Gäste-Hinweise (`guestPageSelectClientHintTemplate`, `guestPlaceholderLanguage`, `placeholderCrmSourceExample`), Resend-Konfig (`configResendApiKeyMissing`), Transaktions-E-Mails (`email*`, `mail.ts` + NextAuth Magic-Link in `auth-email-templates.ts`), Datenschutz- & Impressum-Mustertexte (`privacy*`, `imprint*`, `navImpressum`, `publicFooterLegalPrefix`; rechtlich prüfen und anpassen). Automatisch: `teamAreaLead`, `sourceFromBookingPortal`, `guestPlaceholderLanguage` je nach `htmlLang`. |
| `demoTeamChannelSeedMessages` | Demo-Zeilen für den Team-Chat bei `npm run db:seed` (DE in `FORK_DEFAULTS`; bei `NEXT_PUBLIC_HTML_LANG=en` englische Texte aus `brand-labels-en.ts` über `brand.demoTeamChannelSeedMessages`) |
| `features.*` | Reserviert für spätere Feature-Flags (aktuell Dokumentation) |

Optional können dieselben Werte **ohne Codeänderung** per Build-/Deploy-Umgebung gesetzt werden (siehe `.env.example`, Variablen `NEXT_PUBLIC_*`).

**Locale / Kalender / Daten:** `webapp/src/lib/locale.ts` nutzt `brand.htmlLang` (`NEXT_PUBLIC_HTML_LANG`): `react-big-calendar`, Monatskopf im öffentlichen Buchungswizard, Chat- und Gäste-Zeitstempel, Rechnungs-PDF-Datum, **CHF-Zahlenformat** (`CHFAmount`) sowie `brand.defaultGuestLanguage` (neue Gäste ohne Sprachangabe).

**Englische UI (`NEXT_PUBLIC_HTML_LANG=en`):** Overlay in `webapp/src/config/brand-labels-en.ts` (wird in `brand.ts` über `FORK_DEFAULTS.labels` gelegt). Nicht übersetzte Keys bleiben deutsch — Fork kann `BRAND_LABELS_EN` erweitern. Zusätzlich `NEXT_PUBLIC_MARKETING_TAGLINE` / `NEXT_PUBLIC_HOME_LEAD` für englische Startseite setzen.

## 2. Umgebungsvariablen (Repo-Root `.env.example`)

Nach einem Fork typischerweise anpassen:

- `DOMAIN`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`
- `RESEND_FROM_EMAIL` (verifizierte Absender-Domain bei Resend)
- `ADMIN_NOTIFICATION_EMAIL`, `ADMIN_BOOTSTRAP_EMAIL` (Scripts)
- Datenbanknamen in `DATABASE_URL` / Docker
- Optionale Overrides: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DOMAIN`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_MARKETING_TAGLINE`, `NEXT_PUBLIC_HOME_LEAD`, `NEXT_PUBLIC_HTML_LANG`, `NEXT_PUBLIC_ISSUER_LOCATION`, `NEXT_PUBLIC_SERVICE_SLUG`

## 3. Visuelles Branding

- **Farben / Theme:** `webapp/src/app/globals.css` (CSS-Variablen, Klassen `sk-*`) und ggf. Tailwind-`theme`
- **Login-Hero (Desktop, linke Spalte):** Farbverlauf in `webapp/src/config/brand.ts` unter `loginHero` (oder per `NEXT_PUBLIC_LOGIN_HERO_GRADIENT_FROM` / `_VIA` / `_TO`). Die Deko ist absichtlich **branchenneutral** (weiche Flächen + Welle), keine Ski-Grafik.

## 4. Domain- und ski-spezifische Reste

Ein Fork sollte gezielt suchen nach:

- Routen wie `/gaeste` (URL bleibt deutsch; Inhalt kommt aus `brand.labels`); öffentlich: `/datenschutz`, `/impressum` (Mustertexte in `brand.labels.privacy*` / `imprint*` + `brand.legalPostalAddress` — vor Go-Live juristisch prüfen)
- Drizzle-Enums und Tabellennamen (`guests`, `teachers` in der UI nur indirekt) — Umbenennung der **Datenbank** ist ein größeres Migrationsthema und für viele Verticals nicht nötig, solange die **Oberfläche** über `brand.labels` stimmt
- `webapp/scripts/seed.ts` und `issue-admin-login.ts`: Demo-Adressen über `SEED_EMAIL_DOMAIN` oder `NEXT_PUBLIC_SITE_DOMAIN` (optional `SEED_ADMIN_EMAIL`, `ADMIN_BOOTSTRAP_EMAIL`) — siehe `.env.example`
- `webapp/drizzle.config.ts`: Default-DB-Name
- Rechtstexte: Inhalt über `brand.labels` und `brand.legalPostalAddress`; bei Bedarf Seiten oder Texte durch vom Anwalt freigegebene Fassung ersetzen

## 5. Wartung mehrerer Forks

Wenn du Bugfixes aus **skicoach** übernehmen willst: Änderungen an **`brand.ts`** und markierten Stellen mergen; konfliktarm bleibt es, wenn Produkt-spezifisches nur in `FORK_DEFAULTS` und `.env` liegt.

## 6. Nächste technische Schritte (Roadmap)

Die `features`-Flags in `brand.ts` sind Platzhalter für geplante Funktionen (Zahlung, Gäste-Login, i18n vollständig, …). Code kann später `if (!brand.features.xyz) return null` nutzen — bis dahin sind sie Dokumentation.

Überblick zu Brand/Fork-Texten und offenen Punkten: **`docs/brand-fork-roadmap.md`**.
