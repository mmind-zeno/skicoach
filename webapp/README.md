# skicoach — Webapp

- Spezifikation: **`../skicoachDraft/CLAUDE.md`** · Prompts: **`../skicoachDraft/PROMPTS.md`**
- Docker-Build aus **Repo-Root**: `docker compose build` (Context = dieses Verzeichnis)
- Öffentlicher Health-Check: **`GET /api/public/health`** (JSON, ohne DB)
- Auth: Magic Link (Resend) — bestehende Nutzer mit `is_active = false` werden abgewiesen; neue E-Mails erzeugen einen Nutzer wie von NextAuth vorgesehen
- Kalender (**Prompt 4**): `react-big-calendar`, APIs unter `/api/bookings`, `/api/teachers`, `/api/course-types`, `/api/guests` — für neue Termine mindestens ein **Kurstyp** und **Gast** in der DB (z. B. via Drizzle Studio oder SQL)

**Phase 1 (Prompts 5–9, ohne Stripe/Prompt 10):** Gäste (`/gaeste`), Rechnungen inkl. PDF (`/rechnungen`, `GET /api/invoices/[id]/pdf`), **Chat** (`/chat`) mit **Socket.io** auf `/socket.io` (Echtzeit) und **SWR** als Fallback (längeres Polling, wenn nicht verbunden), Admin (`/admin`, `/admin/anfragen`), öffentlicher Buchungsflow (`/buchen`). Rechnungs-PDF: `src/services/pdf.service.tsx`. Bankdaten PDF: `BANK_*` in `.env`.

**Custom Server:** `npm run dev` / `npm start` / Docker starten **`server.ts`** (Next + Socket.io auf **demselben Port**). Kein `next build`‑`standalone`‑Bundle mehr — Docker kopiert `.next` + `node_modules` (prod) und startet `tsx server.ts`. Reverse Proxy (Caddy/Nginx) muss **WebSocket-Upgrades** für `/socket.io/` durchreichen.

**Design-System (Prompt 3b, Auszug):** `src/lib/colors.ts` (inkl. Status- und Lehrer-Farben laut CLAUDE.md), UI-Bausteine unter `src/components/ui/` (`StatusBadge`, `TeacherBadge`, `TeacherAvatar`, `CHFAmount`, `PageHeader`, `MetricCard`).

**Admin-Einladung (Lehrkraft):** `POST /api/admin/users` legt den Nutzer an und verschickt einen **Magic-Link** über `src/lib/invite-magic-link.ts` (Verification-Token wie Auth.js, **ohne** `signIn()` im API-Route-Handler — sonst könnten Auth-Cookies die Admin-Session überschreiben). Dafür `RESEND_API_KEY`, `AUTH_SECRET`/`NEXTAUTH_SECRET` und eine öffentliche Basis-URL (`AUTH_URL` / `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`) setzen.

**Magic-Link erneut:** `POST /api/admin/users/resend-invite` mit `{ "email": "…" }` (Admin) — z. B. aus dem Admin-Tab „Lehrer & Nutzer“ (**Link erneut**). Hilft, wenn die Einladungs-Mail fehlgeschlagen ist oder der Nutzer schon existiert (409 bei Neuanlage).

**Neue Buchungsanfragen:** Admins sehen ein **Toast** (unten rechts), wenn `/api/admin/requests/count` steigt (Polling 30 s, wie Sidebar-Badge).

**Öffentlich:** `/buchen`, `/datenschutz` (Platzhalter-Text), Nav im `(public)`-Layout.

**Sicherheit (0.2.2+):** Öffentliche Buchungs-`POST` nutzt **Postgres-Rate-Limits** (mehrere Instanzen), optional **Cloudflare Turnstile** (`TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `.env`). Magic-Link-Login: Limits pro IP/Minute und E-Mail/Stunde (DB). Admin: Limits für Lehrer-Einladung / „Link erneut“, **Audit-Log** in Tabelle `audit_logs` (Einladungen, Nutzeränderungen, Kurstyp löschen, Anfragen bestätigen/ablehnen). Migration: `npm run db:migrate` für `0001_rate_limit_audit.sql`.

**0.3.x:** HTTP-**Security-Headers** (`next.config.mjs`), Chat: **Kanal/Empfänger-Prüfung** + Längenlimit (**8000** Zeichen), Socket.io **Rate-Limit** pro Nutzer; Admin-UI **`/admin/audit`**. Docker: Build-Arg **`NEXT_PUBLIC_TURNSTILE_SITE_KEY`**, Image enthält **`drizzle.config.ts`** + **`drizzle-kit`** (Prod-Dep) für `npm run db:migrate` im Container.

**0.3.2:** `poweredByHeader: false`, **`useSecureCookies`** in Production, **`public/robots.txt`**, Login-Seite **zweispaltig / Brand-Panel**, Sidebar **aktiver Eintrag** + Feinschliff, Admin-Dashboard **Balkendiagramm** & **Umsatz-Balken** pro Lehrer, Buchungs-**Erfolgskarte** visuell aufgewertet.

**Kalender:** `?guestId=<uuid>` (z. B. von Gäste-Detail „Neuer Termin“) **vorausfüllt den Gast** im Termin-Modal.

```bash
npm run dev
npm run build
npm run db:generate   # nach Schema-Änderungen
npm run db:migrate    # Migrationen anwenden (Server/CI)
npm run db:test       # DB-Verbindung + Zeilen pro Tabelle (DATABASE_URL in .env)
npm run db:seed       # Dev-Testdaten (idempotent, admin@skicoach.li, Lehrer, Gäste, …)
npm run admin:login-url   # Admin sicherstellen + Magic-Login-URL (24h) auf stdout — ohne Resend; Env wie db:test + AUTH_URL + AUTH_SECRET
```

Initiale Migration: `drizzle/migrations/0000_init.sql` (volles Schema inkl. NextAuth-Tabellen).

### Kurz-Checkliste (Qualität)

1. **`npm run build`** im Ordner `webapp/` ohne Fehler.
2. **Lokal:** `npm run dev` → App unter `http://localhost:3000`; **Chat** öffnen: Badge **„Live (Socket.io)“** sichtbar; zwei Browser mit zwei Nutzern → Nachricht in Kanal erscheint beim anderen ohne Reload.
3. **Ohne** Custom Server (falls jemand nur `next dev` startet): Badge **„Polling“** — dann kein Echtzeit-Chat, nur REST.
4. **Docker:** `docker compose build` / `up`; Proxy (Caddy) leitet **WebSockets** für `/socket.io` durch.
5. **DB:** `npm run db:test` mit gesetzter `DATABASE_URL`.
