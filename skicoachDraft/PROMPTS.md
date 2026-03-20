# PROMPTS.md — Claude Code Prompt-Bibliothek skicoach.li

> **Repo-Layout:** Next.js-App in **`webapp/`**, diese Datei + **`CLAUDE.md`** in **`skicoachDraft/`**.  
> Docker/Compose im **Repo-Root**. Prompt 1 ist grösstenteils erledigt — mit **`webapp/`** weiterarbeiten.

> Diese Prompts sind für Claude Code (nicht claude.ai Chat).
> **`skicoachDraft/CLAUDE.md`** als verbindliche Referenz verwenden.
> Prompts in der Reihenfolge unten ausführen (Abhängigkeiten beachten).

---

## Reihenfolge der Implementierung

1. Projekt-Scaffold + Basis-Setup
2. Datenbank-Schema (Drizzle) — inkl. bookingRequests Tabelle
3. Auth (NextAuth) + globales UI Design-System
4. Kalender & Termine (react-big-calendar)
5. Gästedatenbank
6. Rechnungen (PDF, CHF, MwSt LI)
7. Chat (Socket.io)
8. Admin-Panel
9. **Öffentliches Buchungsportal Phase 1** — Anfrage-System (kein Stripe)
10. Phase 2: Sofortbuchung + Stripe

> Prompt 9 (Buchungsportal) ist jetzt vollständig ausgearbeitet und Teil von Phase 1.
> Stripe kommt erst in Phase 2 — das Portal funktioniert ohne Zahlung sofort.

---

## PROMPT 1 — Projekt-Scaffold

```
Initialisiere ein neues Next.js 14 Projekt für skicoach.li mit folgendem Setup:

Tech Stack:
- Next.js 14 mit App Router
- TypeScript (strict mode)
- Tailwind CSS
- Drizzle ORM
- PostgreSQL
- NextAuth.js v5
- Zod für Validierung

Erstelle die vollständige Ordnerstruktur gemäss CLAUDE.md:
src/features/calendar/
src/features/guests/
src/features/invoices/
src/features/chat/
src/features/auth/
src/features/admin/
src/features/booking-public/   (öffentliches Portal UI, ab Prompt 9)
src/features/payments/         (leer, für Phase 2)
src/services/
src/lib/
src/types/
src/components/ui/
app/(internal)/
app/(public)/
app/api/
drizzle/migrations/

Installiere alle benötigten packages:
- drizzle-orm pg drizzle-kit
- next-auth@beta @auth/drizzle-adapter
- zod
- swr
- @react-pdf/renderer
- socket.io socket.io-client
- resend
- date-fns
- @types/pg

Erstelle:
1. tsconfig.json mit strict: true und path alias @/*
2. tailwind.config.ts mit Standard-Setup
3. src/lib/db.ts (Drizzle PostgreSQL Client als Singleton)
4. src/lib/errors.ts (UnauthorizedError, ForbiddenError, NotFoundError, ValidationError)
5. src/types/index.ts (leere globale Types-Datei)
6. .gitignore (.env, .env.local, node_modules, .next)
7. Leere README.md
```

---

## PROMPT 2 — Datenbank-Schema

> **MUSS 1:1 mit CLAUDE.md „Datenbankschema“ übereinstimmen.**  
> NextAuth.js v5 + `@auth/drizzle-adapter`: Tabellen `accounts`, `sessions`, `verificationTokens` exakt nach [Auth.js Drizzle-Adapter](https://authjs.dev/getting-started/adapters/drizzle) (PostgreSQL-Variante); `users`-Tabelle erweitert die Auth-User-Zeilen um `role`, `phone`, `colorIndex`, `isActive`.

```
Erstelle das vollständige Drizzle ORM Schema für skicoach.li in drizzle/schema.ts.

── users (App + NextAuth; eine Tabelle) ──
  id (uuid, primaryKey, defaultRandom)
  name (varchar 100, notNull)
  email (varchar 255, notNull, unique)
  emailVerified (timestamp, nullable)   ← Magic Link / NextAuth
  image (varchar 500, nullable)         ← Profil-URL (NextAuth-kompatibel)
  role (enum: admin | teacher, default: teacher)
  phone (varchar 30)
  colorIndex (integer, notNull, default: 0)  ← 0–5, Lehrer-Farben
  isActive (boolean, default: true)
  createdAt (timestamp, defaultNow)

── NextAuth (Drizzle Adapter) ──
accounts:
  userId (uuid, FK → users.id, onDelete cascade)
  type (varchar, notNull)
  provider (varchar, notNull)
  providerAccountId (varchar, notNull)
  refresh_token, access_token (text, nullable)
  expires_at (integer, nullable)
  token_type, scope, id_token, session_state (varchar/text, nullable)
  composite unique (provider, providerAccountId)

sessions:
  sessionToken (varchar, primaryKey)
  userId (uuid, FK → users.id, onDelete cascade, notNull)
  expires (timestamp, notNull)

verificationTokens:
  identifier (varchar, notNull)
  token (varchar, notNull)
  expires (timestamp, notNull)
  composite primary key (identifier, token)

── guests ──
  id (uuid, primaryKey, defaultRandom)
  name (varchar 100, notNull)
  email (varchar 255)
  phone (varchar 30)
  niveau (enum: anfaenger | fortgeschritten | experte, default: anfaenger)
  language (varchar 10, default: de)
  notes (text)
  createdAt (timestamp, defaultNow)

── courseTypes ──
  id (uuid, primaryKey, defaultRandom)
  name (varchar 100, notNull)
  durationMin (integer, notNull)
  priceCHF (numeric 10.2, notNull)
  maxParticipants (integer, default: 1)
  isPublic (boolean, default: false)   ← Portal: nur true anzeigen
  isActive (boolean, default: true)

── bookings ──
  id (uuid, primaryKey, defaultRandom)
  teacherId (uuid, FK → users.id, notNull)
  guestId (uuid, FK → guests.id, notNull)
  courseTypeId (uuid, FK → courseTypes.id, notNull)
  date (date, notNull)
  startTime (time, notNull)
  endTime (time, notNull)
  status (enum: geplant | durchgefuehrt | storniert, default: geplant)
  source (enum: intern | anfrage | online, default: intern)
  notes (text)
  priceCHF (numeric 10.2, notNull)
  createdAt (timestamp, defaultNow)

── bookingRequests (öffentliches Portal) ──
  id (uuid, primaryKey, defaultRandom)
  courseTypeId (uuid, FK → courseTypes.id, notNull)
  date (date, notNull)
  startTime (time, notNull)
  guestName (varchar 100, notNull)
  guestEmail (varchar 255, notNull)
  guestPhone (varchar 30)
  guestNiveau (enum: anfaenger | fortgeschritten | experte, notNull)
  message (text)
  status (enum: neu | bestaetigt | abgelehnt, default: neu)
  bookingId (uuid, FK → bookings.id, nullable)
  handledBy (uuid, FK → users.id, nullable)
  handledAt (timestamp, nullable)
  rejectReason (text, nullable)  ← bei Ablehnung
  createdAt (timestamp, defaultNow)

── invoices ──
  id (uuid, primaryKey, defaultRandom)
  invoiceNumber (varchar 20, notNull, unique)  — "2025-0042"
  bookingId (uuid, FK → bookings.id, notNull)
  guestId (uuid, FK → guests.id, notNull)
  amountCHF (numeric 10.2, notNull)
  vatPercent (numeric 5.2, default: 7.7)
  status (enum: offen | bezahlt | storniert, default: offen)
  pdfUrl (varchar 500, nullable)  ← optional interner Pfad/Key, kein öffentliches static
  issuedAt (timestamp, defaultNow)
  paidAt (timestamp, nullable)
  dueDate (date, nullable)

── chatChannels / chatMessages ──
chatChannels:
  id, name, isGeneral, createdAt (wie bisher)

chatMessages:
  id, channelId (nullable), recipientId (nullable), senderId (notNull),
  content, attachmentUrl, createdAt, readAt (wie bisher)

Erstelle ausserdem:
1. drizzle.config.ts (DATABASE_URL aus .env)
2. Drizzle Relations für alle FKs / JOINs
3. TypeScript-Typen in src/types/index.ts exportieren
4. npm scripts: db:generate, db:migrate (oder drizzle-kit push nur dev)
5. Erste Migration: npx drizzle-kit generate
```

---

## PROMPT 3 — Auth (NextAuth.js v5)

```
Implementiere das Auth-System für skicoach.li mit NextAuth.js v5.

Anforderungen:
- Login per Magic Link (E-Mail) — kein Passwort
- Drizzle Adapter für Session-Persistenz in PostgreSQL
- Session enthält: user.id, user.name, user.email, user.role, user.image
- Middleware schützt die **URL-Pfade** /kalender, /gaeste, /rechnungen, /chat, /admin (nicht den Ordnernamen „(internal)“)
- /buchen und /api/public/* bleiben ohne Login

Erstelle:

1. src/lib/auth.ts
   - NextAuth Config mit Resend als E-Mail-Provider
   - Drizzle Adapter eingebunden
   - Session Callback: role und id zur Session hinzufügen
   - Hilfsfunktionen: getSession(), requireAuth(), requireAdmin()

2. app/api/auth/[...nextauth]/route.ts
   - Standard NextAuth Route Handler

3. src/middleware.ts
   - Matcher: geschützte Pfade /kalender, /gaeste, /rechnungen, /chat, /admin
   - Redirect zu /login wenn keine Session
   - Öffentlich: /, /login, /buchen, /api/auth/*, /api/public/*

4. app/(internal)/layout.tsx
   - SessionProvider wrapper
   - Haupt-Navigation mit: Kalender, Gäste, Rechnungen, Chat
   - User-Avatar + Logout oben rechts
   - Responsive Sidebar

5. app/login/page.tsx
   - Magic Link Login Formular
   - E-Mail eingeben → "Link wurde gesendet" Bestätigung
   - skicoach.li Branding (schlicht, professionell)

6. src/features/auth/components/UserAvatar.tsx
   - Avatar mit Initialen-Fallback
   - Dropdown: Profil, Logout

Sicherheitsregeln:
- requireAdmin() wirft ForbiddenError wenn role !== 'admin'
- requireAuth() wirft UnauthorizedError wenn keine Session
- Beide Funktionen in src/lib/auth.ts definiert
```

---

## PROMPT 3b — Globales UI Design-System

> Diesen Prompt direkt nach Prompt 3 (Auth) ausführen, bevor Features gebaut werden.
> Stellt sicher dass ALLE Komponenten konsistent aussehen.

```
Erstelle das globale UI Design-System für skicoach.li gemäss CLAUDE.md.

Primärfarbe: #1B4F8A | Hintergrund: #F7F9FC | Border: rgba(0,0,0,0.08)

Erstelle src/components/ui/ mit folgenden Komponenten:

1. StatusBadge.tsx
   Props: status: 'geplant'|'durchgefuehrt'|'storniert'|'offen'|'bezahlt'|'anfrage'|'storniert_rechnung'
   Farben exakt aus CLAUDE.md Design-System (Status-Farben Sektion)
   Pill-Form, font-size 11px, padding 3px 9px

2. TeacherBadge.tsx
   Props: colorIndex: 0-5, name: string
   Farbiger Punkt + Name, Farben aus CLAUDE.md Lehrer-Farben
   Verwendung: Kalender-Legende, Buchungsliste

3. TeacherAvatar.tsx
   Props: name: string, colorIndex: 0-5, size?: 'sm'|'md'|'lg'
   Kreis mit Initialen, Hintergrundfarbe aus colorIndex
   sm=28px, md=36px, lg=48px

4. CHFAmount.tsx
   Props: amount: number | string, size?: 'sm'|'md'|'lg'
   Formatiert als "CHF 1'240.00" (Schweizer Format mit Apostroph als Tausendertrenner)
   Nutzt Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' })

5. AppLayout.tsx (Haupt-Layout für (internal))
   - Sidebar: 200px, Hintergrund #1B4F8A
   - Logo "skicoach.li" + Saison oben
   - Navigation: Dashboard, Kalender, Gäste, Rechnungen, Chat, Admin (nur für admin role)
   - Aktiver Nav-Item: hellerer Hintergrund rgba(255,255,255,0.18)
   - Ungelesene Chat-Nachrichten als Badge (amber)
   - User-Avatar + Name + Rolle unten in Sidebar
   - Haupt-Content: #F7F9FC Hintergrund

6. PageHeader.tsx
   Props: title: string, actions?: ReactNode
   Weisse Topbar 52px, Titel links (16px 500), Actions rechts
   Border-Bottom 1px rgba(0,0,0,0.08)

7. MetricCard.tsx
   Props: label: string, value: string, sub?: string, subType?: 'positive'|'warning'|'neutral'
   Weisse Card, radius 10px, Icon-Slot oben

8. src/lib/colors.ts
   Exportiert TEACHER_COLORS Array und getTeacherColor(colorIndex) Helper
   Exportiert STATUS_COLORS Objekt
   Zentraler Ort für alle Farb-Definitionen — nie hardcodiert in Komponenten

Wichtig: Alle Farben NUR aus src/lib/colors.ts importieren.
Tailwind CSS für Layout/Spacing, aber Farben über CSS custom properties oder inline styles aus colors.ts.
```

---

## PROMPT 4 — Kalender & Terminverwaltung (react-big-calendar)

```
Implementiere das Kalender-Modul für skicoach.li mit react-big-calendar.

Installiere zuerst:
npm install react-big-calendar date-fns
npm install --save-dev @types/react-big-calendar

Erstelle folgende Dateien:

src/features/calendar/types.ts
  - CalendarEvent Interface (für react-big-calendar):
    { id, title, start: Date, end: Date, resource: Booking }
  - Booking Interface (vollständig mit guest, teacher, courseType)
  - CreateBookingInput, UpdateBookingInput

src/services/booking.service.ts
  - findByTeacher(teacherId, dateFrom, dateTo): BookingWithDetails[]
  - findAll(dateFrom, dateTo): BookingWithDetails[]  ← nur Admin
  - create(input: CreateBookingInput): Booking
  - update(id, input): Booking
  - updateStatus(id, status): Booking
  - delete(id): void
  - checkAvailability(teacherId, date, startTime, endTime): boolean

src/services/availability.service.ts
  ← NEUER SERVICE (wird auch vom öffentlichen Portal genutzt)
  - getMonthAvailability(courseTypeId, year, month):
    Record<string, 'free'|'partial'|'full'|'past'>
  - getDaySlots(courseTypeId, date):
    Array<{ time: string, available: boolean }>
  Logik: Slot verfügbar wenn min. 1 aktiver Lehrer keine überlappende Buchung hat

app/api/bookings/route.ts — GET (mit teacherId, dateFrom, dateTo) + POST
app/api/bookings/[id]/route.ts — GET + PATCH + DELETE

src/features/calendar/hooks/useBookings.ts
  - useSWR für Buchungsliste (nach aktiver Woche/Monat)
  - create, update, updateStatus, delete Mutationen mit optimistic updates
  - showAll: boolean (Admin-Toggle)

src/features/calendar/components/CalendarView.tsx
  Verwendet react-big-calendar mit folgender Konfiguration:
  - localizer: dateFnsLocalizer mit de-Locale
  - defaultView: 'week'
  - views: ['day', 'week', 'month']
  - min: 07:00, max: 20:00
  - eventPropGetter: gibt Hintergrundfarbe aus TEACHER_COLORS[teacher.colorIndex] zurück
  - titleAccessor: "{guest.name} · {courseType.name}"
  - onSelectEvent: öffnet BookingDetailPanel (Panel rechts, kein Modal)
  - onSelectSlot: öffnet BookingCreateModal (selectionBehavior: 'select')
  - CSS-Overrides in calendar.css: Primärfarbe #1B4F8A für Today-Highlight,
    Navigation-Buttons, Selected-Slots
  - Über dem Kalender: TeacherLegend Komponente (Farbpunkte + Namen)
  - Admin-Toggle: "Alle Lehrer anzeigen" Checkbox

src/features/calendar/components/TeacherLegend.tsx
  - Zeigt alle aktiven Lehrer mit Farbpunkt (aus TeacherBadge)
  - Admin-Toggle: alle / nur meine Termine

src/features/calendar/components/BookingCreateModal.tsx
  - Trigger: Klick auf leeren Slot (Datum+Zeit vorausgefüllt)
  - Felder: Gast (Suche mit Autocomplete), Kurstyp (Select mit Preis),
    Datum, Startzeit, Endzeit (auto aus Kurstyp-Dauer)
  - Verfügbarkeits-Check: zeigt Warnung wenn Lehrer bereits Termin hat
  - Preis: wird aus Kurstyp vorausgefüllt, manuell überschreibbar
  - Validierung mit Zod im Frontend

src/features/calendar/components/BookingDetailPanel.tsx
  - Rechte Seitenleiste (nicht Popup), 320px breit
  - Zeigt: Gast (klickbar → Gästeseite), Lehrer, Kurstyp, Zeit, Preis, Status
  - StatusBadge Komponente
  - Aktionen: Status ändern, Bearbeiten, Löschen, "Rechnung erstellen"
  - Buchungsanfragen-Badge: wenn source='anfrage' → zeigt ursprüngliche Kundennachricht

app/(internal)/kalender/page.tsx
  - CalendarView + BookingDetailPanel nebeneinander (CSS Grid)
  - Panel nur sichtbar wenn Event ausgewählt
  - Responsiv: auf Mobile Panel als Drawer von unten
```

---

## PROMPT 5 — Gästedatenbank

```
Implementiere die Gästedatenbank für skicoach.li.

src/features/guests/types.ts
  - Guest Interface
  - GuestWithBookings Interface (inkl. bookings[])
  - CreateGuestInput, UpdateGuestInput

src/services/guest.service.ts
  - findAll(search?: string): Guest[]
  - findById(id): GuestWithBookings
  - create(input: CreateGuestInput): Guest
  - update(id, input: UpdateGuestInput): Guest
  - delete(id): void
  - findOrCreateByEmail(email, name): Guest  ← wichtig für Schnelleingabe

app/api/guests/route.ts
  - GET: Liste mit Suche (query param: search)
  - POST: Neuen Gast erstellen

app/api/guests/[id]/route.ts
  - GET: Gast mit Buchungshistorie
  - PATCH: Gast aktualisieren
  - DELETE: Gast löschen (nur Admin)

src/features/guests/hooks/useGuests.ts
  - useSWR Hook
  - CRUD Mutationen

src/features/guests/components/GuestList.tsx
  - Tabelle mit: Name, E-Mail, Telefon, Niveau, Letzte Buchung
  - Suchfeld (Live-Suche mit 300ms Debounce)
  - Filter: nach Niveau
  - Klick → GuestDetailPanel

src/features/guests/components/GuestDetailPanel.tsx
  - Alle Gastinformationen (editierbar)
  - Buchungshistorie (Liste aller Termine)
  - Offene Rechnungen Badge
  - Button: "Neuer Termin" (öffnet CalendarView mit vorausgewähltem Gast)

src/features/guests/components/GuestCreateModal.tsx
  - Schnell-Erfassung: Name (required), E-Mail, Telefon, Niveau, Notizen
  - Wird auch vom BookingCreateModal aus aufgerufen

app/(internal)/gaeste/page.tsx
  - GuestList + GuestDetailPanel nebeneinander (Desktop)
  - Responsive: auf Mobile jeweils Vollbild
```

---

## PROMPT 6 — Rechnungen (PDF)

```
Implementiere das Rechnungsmodul mit automatischer PDF-Generierung für skicoach.li.

Besonderheiten:
- Währung: CHF (Schweizer Franken)
- MwSt: 7.7% (Liechtenstein)
- Rechnungsnummer Format: YYYY-NNNN (z.B. "2025-0042", fortlaufend pro Jahr)
- PDF direkt im Browser downloadbar

src/features/invoices/types.ts
  - Invoice Interface
  - InvoiceWithDetails (inkl. booking, guest)
  - CreateInvoiceInput

src/services/invoice.service.ts
  - findAll(filters?: {status, guestId, teacherId}): Invoice[]
  - findById(id): InvoiceWithDetails
  - create(bookingId): Invoice  ← generiert Nummer automatisch
  - generateNextNumber(year): string  ← "2025-0042"
  - markAsPaid(id): Invoice
  - cancel(id): Invoice

src/services/pdf.service.ts
  - generateInvoicePDF(invoiceId): Buffer
  - Verwendet @react-pdf/renderer
  - KEINE Ablage unter /public/ (keine öffentlich erratbaren URLs)
  - Optional: temporärer Speicher nur serverseitig oder rein on-the-fly im API-Handler

app/api/invoices/route.ts
  - GET: Liste mit Filtern
  - POST: Rechnung aus Buchung erstellen

app/api/invoices/[id]/route.ts
  - GET: Einzelne Rechnung
  - PATCH: Status updaten

app/api/invoices/[id]/pdf/route.ts
  - GET: requireAuth + Rechte (Admin oder zugehöriger Lehrer laut Rollenregel)
  - PDF generieren und als Download zurückgeben, Content-Type: application/pdf

src/features/invoices/components/InvoicePDFTemplate.tsx
  - React-PDF Komponente
  - Layout: skicoach.li Logo oben, Adresse, Rechnungsnummer, Datum
  - Tabelle: Position, Beschreibung (Kurstyp + Datum + Uhrzeit), Menge, Preis
  - Zwischensumme, MwSt 7.7%, Total CHF
  - Zahlungsinformationen (Bankdaten aus .env)
  - Footer: skicoach.li | Liechtenstein

src/features/invoices/components/InvoiceList.tsx
  - Tabelle: Nummer, Gast, Datum, Betrag, Status (Badges: offen/bezahlt/storniert)
  - Filter: Status, Datum
  - Aktionen: PDF Download, Als bezahlt markieren

src/features/invoices/components/InvoiceDetailModal.tsx
  - Alle Rechnungsdetails
  - PDF Vorschau: iframe mit Object-URL aus authentisiertem GET /api/invoices/[id]/pdf (kein /public/)
  - PDF Download Button (gleiche Route)
  - Status ändern

app/(internal)/rechnungen/page.tsx
  - InvoiceList Vollseite
  - Statistik-Banner: Offen CHF, Bezahlt CHF (aktueller Monat)
```

---

## PROMPT 7 — Interner Chat (Socket.io)

```
Implementiere den internen Team-Chat für skicoach.li mit Socket.io.

Architektur:
- Socket.io Server läuft als separater Prozess (server.ts im Root)
- Next.js App verbindet sich als Client
- Authentifizierung: Socket überträgt NextAuth Session Token
- **Docker:** Dockerfile CMD muss diesen Prozess starten (z. B. `node server.js`), nicht `next start` allein — oder Chat als eigener kleiner Service im Compose auslagern

Erstelle:

server.ts (Root, neben package.json)
  - Custom Next.js Server mit Socket.io
  - Auth Middleware: Socket-Verbindung nur mit gültiger Session
  - Events: message:send, message:received, user:online, user:offline, channel:join

src/lib/socket.ts
  - Socket.io Client Singleton
  - Auto-reconnect

src/services/chat.service.ts
  - getChannels(): ChatChannel[]
  - getMessages(channelId, limit, before?): ChatMessage[]  ← Pagination
  - getDirectMessages(userId1, userId2): ChatMessage[]
  - createChannel(name): ChatChannel
  - markAsRead(messageId): void

app/api/chat/channels/route.ts
  - GET: Alle Kanäle
  - POST: Neuer Kanal (nur Admin)

app/api/chat/messages/route.ts
  - GET: Nachrichten (Query: channelId oder recipientId, limit, before)

src/features/chat/hooks/useChat.ts
  - Socket.io Verbindung verwalten
  - Online-Status anderer User
  - Ungelesene Nachrichten zählen

src/features/chat/components/ChatLayout.tsx
  - Links: Kanalliste + Direktnachrichten
  - Rechts: Nachrichten-Feed + Eingabefeld
  - Ungelesene Badge auf Kanälen

src/features/chat/components/MessageFeed.tsx
  - Nachrichten chronologisch
  - Eigene Nachrichten rechts, andere links
  - Datum-Trennlinie zwischen Tagen
  - Infinite Scroll (ältere Nachrichten laden)
  - Optimistic Updates (Nachricht sofort anzeigen, dann bestätigen)

src/features/chat/components/MessageInput.tsx
  - Textfeld mit Enter-to-Send
  - Shift+Enter für Zeilenumbruch

app/(internal)/chat/page.tsx
  - ChatLayout Vollseite
  - Beim ersten Laden: "Team" Kanal automatisch erstellen falls nicht vorhanden
```

---

## PROMPT 8 — Admin-Panel

```
Implementiere das Admin-Panel für skicoach.li.
Nur für User mit role === 'admin' zugänglich (Middleware prüft dies).

src/services/admin.service.ts
  - getStats(): { bookingsThisMonth, revenueThisMonth, activeTeachers, totalGuests }
  - getRevenueByTeacher(year, month): { teacher, revenue, bookingCount }[]
  - getBookingsByMonth(year): { month, count }[]

app/api/admin/stats/route.ts
  - GET: Dashboard-Statistiken

app/api/admin/users/route.ts
  - GET: Alle User
  - POST: Neuen Skilehrer einladen (sendet Magic-Link per Mail)

app/api/admin/users/[id]/route.ts
  - PATCH: Rolle ändern, deaktivieren
  - DELETE: User löschen

app/api/admin/course-types/route.ts
  - GET/POST: Kurstypen verwalten

app/api/admin/course-types/[id]/route.ts
  - PATCH/DELETE: Kurstyp bearbeiten

src/features/admin/components/Dashboard.tsx
  - 4 Metric Cards: Buchungen diesen Monat, Umsatz CHF, Aktive Lehrer, Gäste total
  - Balkendiagramm: Buchungen pro Monat (letztes Jahr)
  - Tabelle: Umsatz pro Lehrer (aktueller Monat)

src/features/admin/components/TeacherManagement.tsx
  - Liste aller Skilehrer (Name, E-Mail, Rolle, Status, letzte Aktivität)
  - "Lehrer einladen" Button → E-Mail eingeben → Magic Link senden
  - Rolle ändern (teacher ↔ admin)
  - Lehrer deaktivieren (isActive = false, kein Login mehr möglich)

src/features/admin/components/CourseTypeManagement.tsx
  - Liste aller Kurstypen
  - Erstellen / Bearbeiten: Name, Dauer (Minuten), Preis CHF, Max. Teilnehmer
  - Aktivieren / Deaktivieren

app/(internal)/admin/page.tsx
  - Dashboard als Startseite
  - Navigation: Dashboard | Lehrer | Kurstypen | Anfragen (Link zu /admin/anfragen)
  - Redirect zu /kalender wenn User kein Admin ist

API für Buchungsanfragen (nur Admin — Umsetzung zusammen mit Prompt 9 UI):

app/api/admin/requests/route.ts
  - GET: Liste bookingRequests (optional ?status=neu|...)

app/api/admin/requests/[id]/route.ts
  - GET: Einzelanfrage

app/api/admin/requests/[id]/confirm/route.ts
  - POST: Body { teacherId } → booking-request.service.confirm()

app/api/admin/requests/[id]/reject/route.ts
  - POST: Body { reason? } → reject()

app/api/admin/requests/count/route.ts
  - GET: { count: number } für status=neu (Sidebar-Badge / Polling)
```

---

## PROMPT 9 — Öffentliches Buchungsportal (Phase 1 — kein Stripe)

> Vor diesem Prompt sicherstellen: availability.service.ts aus Prompt 4 ist fertig.
> Das Portal baut darauf auf.

```
Implementiere das öffentliche Buchungsanfrage-Portal für skicoach.li.
URL: /buchen — Produktion: https://skicoach.mmind.space/buchen — kein Login.
KEIN Stripe, KEINE Zahlung — nur Anfrage stellen, Admin bestätigt manuell.

Designvorgaben aus CLAUDE.md:
- Primärfarbe #1B4F8A für Navbar, Buttons, Highlights
- Hintergrund #F7F9FC
- Freie Slots: #EAF3DE (grün) | Teilweise: #FEF3C7 (amber) | Voll: #FEE2E2 (rot)
- Ausgewählter Slot: #1B4F8A (primär, weisse Schrift)
- Ansprechendes, modernes Design — Kunden sehen das als erstes!
- Mobile-first: funktioniert auf Smartphone genauso gut wie Desktop

NEUE API ROUTES (public — kein Auth, rate-limited):

app/api/public/availability/route.ts
  GET ?courseTypeId=X&month=2025-03
  → Ruft availability.service.getMonthAvailability() auf
  → { availability: Record<string, 'free'|'partial'|'full'|'past'> }
  Kein Auth; Rate-Limit z. B. @upstash/ratelimit + Redis, oder einfacher In-Memory-Limiter
  pro IP (nur ok bei einem Node-Instanz): max. 60 GET/Minute. Zusätzlich Honeypot-Feld
  im POST /api/public/requests gegen Spam-Bots.

app/api/public/slots/route.ts
  GET ?courseTypeId=X&date=2025-03-18
  → Ruft availability.service.getDaySlots() auf
  → { slots: Array<{ time: string, available: boolean }> }
  Keine Lehrernamen, keine internen Daten in der Response

app/api/public/requests/route.ts
  POST — neue Buchungsanfrage erstellen
  Zod-Schema:
    courseTypeId: uuid
    date: string (YYYY-MM-DD)
    startTime: string (HH:MM)
    guestName: string min 2 max 100
    guestEmail: string email
    guestPhone: string optional
    guestNiveau: 'anfaenger'|'fortgeschritten'|'experte'
    message: string optional max 500
  → Erstellt bookingRequest in DB (status: 'neu')
  → Sendet Mail an ADMIN_NOTIFICATION_EMAIL (.env) via mail.service
  → Sendet Bestätigungs-Mail an Gast (Resend)
  → { success: true, requestId: string }

SERVICES:

src/services/booking-request.service.ts
  - create(input): BookingRequest
  - findAll(status?): BookingRequest[]  ← nur intern
  - findById(id): BookingRequest
  - confirm(id, teacherId): Booking  ← erstellt Buchung + Gast wenn neu
  - reject(id, reason?): BookingRequest
  - sendConfirmationMail(request): void
  - sendAdminNotification(request): void

src/lib/mail.ts
  Resend-Client konfiguriert.
  Funktionen:
  - sendBookingRequestConfirmation(to, requestDetails): void
    Mail an Kunden: "Wir haben Ihre Anfrage erhalten..."
  - sendAdminNewRequest(request): void
    Mail an ADMIN_NOTIFICATION_EMAIL: neue Anfrage mit Details + Link zur App (intern)
  - sendBookingConfirmed(to, bookingDetails): void
    Mail an Kunden nach Admin-Bestätigung: "Ihr Kurs ist bestätigt!"

ÖFFENTLICHE UI (app/(public)/buchen/):

app/(public)/layout.tsx
  - Öffentliches Layout: Navbar mit skicoach.li Logo + Links
  - Kein Sidebar — volle Breite
  - Footer: Kontakt, Datenschutz (Links)
  - Responsive

app/(public)/buchen/page.tsx
  4-Schritt-Wizard (Schritt-Indikator oben, persistent sichtbar):

  Schritt 1 — Kurstyp wählen
  - Karten für jeden isPublic=true Kurstyp
  - Jede Karte: Name, Dauer (z.B. "1 Stunde"), Max. Teilnehmer, Preis CHF
  - Highlight bei Auswahl (border #1B4F8A, Hintergrund #E8F0FA)
  - Fetch von /api/public/course-types (neuer einfacher Endpoint)

  Schritt 2 — Datum wählen (Monatskalender)
  - Kompakter Monatskalender (selbst gebaut, kein react-big-calendar hier)
  - Monat vor/zurück Navigation
  - Tage farbig: grün=frei (#EAF3DE), amber=teilweise (#FEF3C7),
    rot=voll (#FEE2E2), grau=vergangen
  - Klick auf freien/teilweise-freien Tag → zu Schritt 3
  - Legende unter Kalender
  - Fetch von /api/public/availability (beim Monatswechsel neu laden)

  Schritt 3 — Uhrzeit + persönliche Daten
  Links: Zeitslots des gewählten Tages
  - Slots als Pills: frei (grün), belegt (grau durchgestrichen), ausgewählt (primär)
  - Zeigt Endzeit automatisch (Start + Kursdauer)
  - Fetch von /api/public/slots

  Rechts: Formular
  - Vorname, Nachname (zwei Spalten)
  - E-Mail (required)
  - Telefon (optional)
  - Fahrkönnen: Pill-Toggle (Anfänger / Fortgeschritten / Experte)
  - Nachricht (optional, Textarea)
  - Zusammenfassung der Buchung (Kurstyp, Datum, Zeit, Preis)
  - Hinweis: "Keine Zahlung jetzt — wir bestätigen per E-Mail innerhalb 24h"
  - Absenden-Button: "Anfrage senden →"

  Schritt 4 — Bestätigung
  - Grüne Bestätigungs-Box mit Häkchen-Icon
  - "Vielen Dank, [Name]! Ihre Anfrage wurde erhalten."
  - Zusammenfassung der Anfrage
  - "Sie erhalten in Kürze eine Bestätigungs-Mail an [email]"
  - Button: "Neue Anfrage stellen"

app/api/public/course-types/route.ts
  GET — gibt alle isPublic=true AND isActive=true Kurstypen zurück
  Nur: id, name, durationMin, priceCHF, maxParticipants
  KEINE internen Felder

INTERNE UI — Admin-Anfragen-Verwaltung:

src/features/admin/components/BookingRequests.tsx
  - Liste aller Anfragen (sortiert: neu zuerst)
  - Status-Badge: neu (lila), bestätigt (grün), abgelehnt (grau)
  - Pro Anfrage: Gastname, Kurstyp, Datum+Zeit, Niveau, Nachricht
  - Aktionen:
    "Bestätigen" → TeacherSelectModal (Lehrer zuweisen) → confirm()
    "Ablehnen" → optionale Begründung → reject()
  - Nach Bestätigung: Buchung erscheint automatisch im Kalender

src/features/admin/components/TeacherSelectModal.tsx
  - Zeigt alle aktiven Lehrer
  - Prüft Verfügbarkeit für den angefragten Slot (grüner Haken / rotes X)
  - Bestätigung mit gewähltem Lehrer

app/(internal)/admin/anfragen/page.tsx
  - BookingRequests Vollseite
  - Counter in Sidebar-Badge (unbearbeitete Anfragen)

BENACHRICHTIGUNGEN:
- Neue Anfrage → Badge-Counter in Admin-Sidebar sofort aktualisieren (via SWR revalidate)
- Toast-Notification im Admin-Panel: "Neue Buchungsanfrage von [Name]"
- Implementierung: useSWR polling alle 30 Sekunden auf /api/admin/requests/count
```

---

## PROMPT 10 — Phase 2: Sofortbuchung + Stripe

> Erst ausführen wenn Phase 1 vollständig getestet und live ist.
> Baut auf bookingRequests-Struktur aus Prompt 9 auf — kein Refactoring nötig.

```
Erweitere das Buchungsportal um Sofortbuchung mit Stripe-Zahlung.
Das bestehende Anfrage-System bleibt als Fallback erhalten.

Neue Felder in bookings Tabelle (Migration):
  stripePaymentIntentId: varchar(255) nullable
  stripeStatus: varchar(50) nullable

Neue Services:
src/services/payment.service.ts
  - createPaymentIntent(amountCHF, bookingId, guestEmail): PaymentIntent
  - confirmPayment(paymentIntentId): Payment
  - refund(paymentIntentId, amountCHF?): Refund
  - handleWebhook(event: Stripe.Event): void

Neue API Routes:
app/api/public/checkout/route.ts
  POST — erstellt Stripe PaymentIntent + vorläufige Buchung (status: 'pending')
app/api/webhooks/stripe/route.ts
  POST — Stripe Webhook: payment_intent.succeeded → Buchung bestätigen

Änderung an Portal-Flow (app/(public)/buchen/):
  Schritt 3: neuer Schritt "Zahlung" zwischen Formular und Bestätigung
  - Stripe Elements (Card Payment)
  - Zeigt Betrag CHF + MwSt 7.7%
  - "Jetzt CHF X bezahlen" Button

Admin-Panel Erweiterung:
  - Rechnungen: Zahlungsstatus aus Stripe
  - Rückerstattungen direkt aus Admin-Panel
  - Export: CSV mit allen Stripe-Transaktionen

E-Mails erweitern:
  - Zahlungsbestätigung mit Quittung
  - Storno + automatische Rückerstattung
```

---

## Nützliche Einzel-Prompts

### Datenbankverbindung testen
```
Erstelle ein Script scripts/test-db.ts das die PostgreSQL Verbindung testet,
alle Tabellen auflistet und die Anzahl Einträge pro Tabelle ausgibt.
Ausführbar mit: npx tsx scripts/test-db.ts
```

### Seed-Daten erstellen
```
Erstelle ein Seed-Script scripts/seed.ts für skicoach.li das folgende Testdaten anlegt:
- 1 Admin User (admin@skicoach.li, colorIndex: 0, image null, emailVerified gesetzt)
- 4 Skilehrer (lehrer1-4@skicoach.li, colorIndex: 1-4)
- 3 Kurstypen (Privat 1h CHF 120 isPublic:true, Privat 2h CHF 220 isPublic:true, Gruppe CHF 80 isPublic:true)
- 5 Testgäste mit je 2-3 Buchungen (source: 'intern')
- 2 Buchungsanfragen (status: 'neu') — simuliert Portal-Anfragen
- 3 Chat-Kanäle (Team isGeneral:true, Sicherheit, Allgemein)
- 5 Test-Chat-Nachrichten im Team-Kanal
Ausführbar mit: npx tsx scripts/seed.ts
```

### Backup-Script
```
Erstelle ein Script scripts/backup.sh das:
- pg_dump auf die lokale PostgreSQL Datenbank ausführt
- Die Datei nach /backups/skicoach_DATUM.dump speichert
- Dumps älter als 30 Tage löscht
- Eine Erfolgsmeldung ausgibt
Als Cronjob eintragbar: 0 2 * * * /path/to/scripts/backup.sh
```

### Neue Migration erstellen
```
Ich möchte folgendes Feld zur guests Tabelle hinzufügen:
- birthYear (integer, nullable) — Geburtsjahr des Gastes

Erstelle:
1. Die Schema-Änderung in drizzle/schema.ts
2. Die Drizzle Migration
3. Das TypeScript Interface in src/types/index.ts aktualisieren
4. Den guest.service.ts um das neue Feld erweitern
```
