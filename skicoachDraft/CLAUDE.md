# CLAUDE.md — skicoach.li Projektspezifikation

> Dieses Dokument ist die verbindliche Architektur- und Coding-Referenz.
> Claude Code liest dieses File automatisch und befolgt alle Regeln in jedem Prompt.

---

## Projektübersicht

**skicoach.li** — Web-App für Skischule Liechtenstein, zwei Bereiche:

### Interner Bereich (Login erforderlich)
- Kalender & Terminverwaltung 15+ Skilehrer (react-big-calendar)
- Gästedatenbank
- Rechnungen automatisch (PDF, CHF, 7.7% MwSt LI)
- Team-Chat (Socket.io)
- Admin-Panel

### Öffentlicher Bereich — skicoach.li/buchen (kein Login)
- Phase 1: Buchungsanfrage — Kurstyp wählen → freie Slots sehen → Anfrage stellen → Admin bestätigt
- Phase 2: Sofortbuchung + Stripe

---

## Tech-Stack (verbindlich)

| Schicht | Technologie |
|---|---|
| Framework | Next.js 14 App Router |
| Sprache | TypeScript strict |
| ORM | Drizzle ORM |
| Datenbank | PostgreSQL 16 |
| Auth | NextAuth.js v5 (Magic Link) |
| Styling | Tailwind CSS |
| Kalender-UI | react-big-calendar + date-fns (Deutsch) |
| PDF | @react-pdf/renderer |
| E-Mail | Resend |
| Chat | Socket.io self-hosted |
| Validierung | Zod |
| Deployment | Docker + PostgreSQL auf Hetzner (siehe unten) |
| Phase 2 | Stripe |

### Produktion (mmind.space)

- **Öffentliche URL:** `https://skicoach.mmind.space` — **DNS A-Record → `49.13.139.206`** (Produktions-Server für Skicoach).
- **Gleiches Muster wie aiact / Forklore** (Skills): Skicoach-Compose **bindet nicht** 80/443 auf dem Host. Die Next-App ist nur **`127.0.0.1:HOST_APP_PORT`** erreichbar (Standard **3002**); **TLS und Reverse Proxy** laufen auf dem Host.
- **Dieser Server:** Läuft bereits **n8n + Caddy** (+ Qdrant). **n8n nicht anfassen** — Skicoach ergänzt nur einen **weiteren Server-Block** in **Caddy** (`caddy-skicoach.caddyfile` im Draft). Caddy bleibt alleiniger Eintrag für 80/443; kein zweiter Nginx/Caddy-Stack für Skicoach.
- **Andere mmind-Apps** (aiact, Forklore, …) können weiter auf **`195.201.145.97`** mit **Nginx** liegen — dort gilt bei Bedarf `nginx-skicoach.conf` statt Caddy.
- Optional: Greenfield ohne bestehenden Proxy → `docker-compose.traefik.yml` (Traefik auf 80/443).
- Nach Änderung von `NEXTAUTH_URL` o. ä.: `docker compose up -d --force-recreate` (Container neu erstellen).

---

## Design-System (verbindlich für ALLE Komponenten)

### Farben
```
Primär:          #1B4F8A  (Dunkelblau — Sidebar, Buttons, Links)
Primär-Hell:     #E8F0FA  (Hover, selektierte Elemente)
Primär-Mid:      #4A7EC7  (Borders, Icons)
Hintergrund:     #F7F9FC  (App-Hintergrund, Schnee-Weiss)
Text:            #1A1A2E
Text-Muted:      #6B7280
Border:          rgba(0,0,0,0.08)
```

### Lehrer-Farben (aus colorIndex in DB — überall konsistent)
```
0 → Blau   Event-BG: #DBEAFE  Text: #1e40af  Dot: #3b82f6
1 → Grün   Event-BG: #DCF5E7  Text: #166534  Dot: #22c55e
2 → Lila   Event-BG: #EDE9FE  Text: #5b21b6  Dot: #8b5cf6
3 → Amber  Event-BG: #FEF3C7  Text: #92400e  Dot: #f59e0b
4 → Coral  Event-BG: #FFE4E6  Text: #9f1239  Dot: #f43f5e
5 → Teal   Event-BG: #CCFBF1  Text: #115e59  Dot: #14b8a6
```
Farbe IMMER aus user.colorIndex laden — nie hardcodiert.

### Status-Farben (überall identisch)
```
geplant:       #DBEAFE / #1e40af  (Blau)
durchgeführt:  #DCFCE7 / #166534  (Grün)
storniert:     #F1F5F9 / #64748b  (Grau)
offen:         #FEF3C7 / #92400e  (Amber)
bezahlt:       #DCFCE7 / #166534  (Grün)
anfrage (neu): #EDE9FE / #5b21b6  (Lila)
```

### Layout
```
Sidebar:        200px, #1B4F8A, weiße Schrift
Topbar:         Weiss, 52px, Titel links — Actions rechts
Content-Padding: 20px
Cards:          weiss, border 1px rgba(0,0,0,0.08), radius 10px
Border-Radius:  Buttons 8px, Pills 20px, Cards 10px
Schrift:        12–15px, Weights: 400 body / 500 labels
```

### Kalender (react-big-calendar)
```
- Standard: Wochenansicht, 07:00–20:00
- Events: Lehrer-Farbe als Hintergrund, Gastname + Kurstyp + Uhrzeit
- Klick auf Event: Detail-Panel rechts (kein Popup)
- Klick auf leere Zelle: CreateModal
- Admin-Toggle: Alle Lehrer / Eigene Termine
- Legende: Farbpunkte + Lehrernamen unter Kalender
- Views: Tag, Woche, Monat
- Lokalisation: Deutsch (date-fns de Locale)
```

---

## Architektur (nie brechen)

### Ordnerstruktur
```
src/
  features/
    calendar/components/ hooks/ types.ts
    guests/components/ hooks/ types.ts
    invoices/components/ hooks/ types.ts
    chat/components/ hooks/
    auth/components/
    admin/components/
    booking-public/components/ hooks/ types.ts
    payments/                              ← Phase 2, vorerst leer
  services/
    booking.service.ts
    guest.service.ts
    invoice.service.ts
    pdf.service.ts
    chat.service.ts
    admin.service.ts
    availability.service.ts                ← freie Slots für Portal
    booking-request.service.ts             ← Anfragen vom Portal
    payment.service.ts                     ← Phase 2
  lib/
    db.ts auth.ts socket.ts errors.ts mail.ts
  types/index.ts
  components/ui/
app/
  (internal)/kalender/ gaeste/ rechnungen/ chat/ admin/
  (public)/buchen/
  api/
    bookings/ guests/ invoices/ chat/ admin/
    admin/requests/ admin/requests/[id]/confirm|reject/ admin/requests/count/
    public/course-types/ public/availability/ public/slots/ public/requests/
    webhooks/stripe/                       ← Phase 2
drizzle/schema.ts migrations/
```

### Schichten-Prinzip
```
UI → Hooks (useSWR) → API Routes (Zod) → Services → Drizzle → PostgreSQL
```
Kein React-Code greift je direkt auf die Datenbank zu.

### Next.js Middleware (geschützte URLs)

Route-Gruppen wie `app/(internal)/` erscheinen **nicht** in der URL. Middleware matcht auf **echte Pfade**:

- **Geschützt (Login):** `/kalender`, `/gaeste`, `/rechnungen`, `/chat`, `/admin` (und Unterpfade)
- **Öffentlich:** `/`, `/login`, `/buchen`, `/api/auth/*`, `/api/public/*`
- **API intern:** alle anderen `/api/*` nur mit gültiger Session (bzw. wie in `src/middleware.ts` definiert)

---

## Datenbankschema

```typescript
// users — Skilehrer & Admins (+ NextAuth.js: emailVerified, image)
users: id, name, email, emailVerified, image (Profil-URL, nullable),
       role(admin|teacher), phone, colorIndex(0-5), isActive, createdAt

// guests — Gäste
guests: id, name, email, phone, niveau(anfaenger|fortgeschritten|experte),
        language(de), notes, createdAt

// courseTypes — Kurstypen
courseTypes: id, name, durationMin, priceCHF, maxParticipants,
             isPublic(true=im Portal sichtbar), isActive

// bookings — Termine
bookings: id, teacherId, guestId, courseTypeId, date, startTime, endTime,
          status(geplant|durchgefuehrt|storniert),
          source(intern|anfrage|online),   ← woher kam die Buchung
          notes, priceCHF, createdAt

// bookingRequests — Anfragen vom öffentlichen Portal
bookingRequests: id, courseTypeId, date, startTime,
                 guestName, guestEmail, guestPhone, guestNiveau, message,
                 status(neu|bestaetigt|abgelehnt),
                 bookingId(nach Bestätigung gesetzt),
                 handledBy, handledAt, rejectReason(optional bei Ablehnung), createdAt

// invoices — Rechnungen
invoices: id, invoiceNumber(2025-0042), bookingId, guestId,
          amountCHF, vatPercent(7.7), status(offen|bezahlt|storniert),
          pdfUrl, issuedAt, paidAt, dueDate

// chatChannels + chatMessages (Socket.io)
chatChannels: id, name, isGeneral, createdAt
chatMessages: id, channelId, recipientId, senderId, content,
              attachmentUrl, createdAt, readAt
```

---

## Öffentliches Buchungsportal

### Was Kunden sehen DÜRFEN
```
✓ Kurstypen (Name, Dauer, Preis) — nur isPublic=true
✓ Tage: grün=frei / gelb=teilweise / rot=voll
✓ Zeitslots: frei oder belegt (keine Details)
✗ KEINE Lehrernamen
✗ KEINE anderen Gäste
✗ KEINE internen Daten
```

### Availability-Berechnung
```typescript
// GET /api/public/availability?courseTypeId=X&month=2025-03
// → { "2025-03-18": "free" | "partial" | "full" | "past" }
// Basiert auf: bestehende Buchungen + Anzahl aktiver Lehrer

// GET /api/public/slots?courseTypeId=X&date=2025-03-18
// → [{ time: "08:00", available: true|false }, ...]
// Slot verfügbar wenn: mindestens 1 Lehrer hat keine überlappende Buchung
// Bei maxParticipants > 1 (Gruppenkurs): Kapazität pro Slot zusätzlich modellieren
// (Summe gebuchter Plätze vs. Kapazität), nicht nur „ein Lehrer frei“.
```

### Zeitzone

Alle **Kalender- und Buchungslogik** konsistent in **Europe/Zurich** (Wall-Clock für Datum/Uhrzeit) dokumentieren; Server-UTC vs. Anzeige mit `date-fns-tz` oder explizite Speicherregel in Services festhalten.

### Rechnungs-PDFs

PDFs **nicht** unter `public/` ablegen (keine erratbaren öffentlichen URLs). Auslieferung nur über **authentisierte** Route (z. B. `GET /api/invoices/[id]/pdf` mit Berechtigungsprüfung), optional generiert aus Buffer ohne persistente öffentliche Datei.

### Anfrage-Flow
```
1. Portal → POST /api/public/requests → bookingRequest (status: neu)
2. System → Mail an admin@skicoach.li + App-Notification
3. Admin → Bestätigen + Lehrer wählen → booking wird erstellt
4. System → Bestätigungs-Mail an Kunden
```

---

## Rollen & Berechtigungen

| | Teacher | Admin |
|---|---|---|
| Eigene Termine | ✓ | ✓ |
| Alle Termine | ✗ | ✓ |
| Gäste | ✓ | ✓ |
| Eigene Rechnungen | ✓ | ✓ |
| Alle Rechnungen | ✗ | ✓ |
| Buchungsanfragen | ✗ | ✓ |
| Kurstypen verwalten | ✗ | ✓ |
| User verwalten | ✗ | ✓ |
| Chat | ✓ | ✓ |

---

## Coding-Konventionen

```
Dateinamen:    PascalCase.tsx (Komponenten) | useX.ts (Hooks) | x.service.ts
Imports:       immer @/ Alias
Währung:       numeric in DB, "CHF 1'240.00" anzeigen (Schweizer Format)
Datum:         date-fns, Locale de-CH
API-Response:  { data: T } Erfolg | { error: string } Fehler
Fehlerklassen: UnauthorizedError | ForbiddenError | NotFoundError in src/lib/errors.ts
```

---

## Checkliste für jedes neue Feature

1. [ ] Schema in `drizzle/schema.ts`
2. [ ] Migration: `npx drizzle-kit generate`
3. [ ] TypeScript-Interface in `src/features/{f}/types.ts`
4. [ ] Service in `src/services/{f}.service.ts`
5. [ ] API Route mit Zod in `src/app/api/{f}/route.ts`
6. [ ] useSWR Hook in `src/features/{f}/hooks/`
7. [ ] Komponenten in `src/features/{f}/components/`
8. [ ] Design: #1B4F8A primär, Lehrer-Farben aus colorIndex, Status-Farben konsistent
9. [ ] `.env.example` aktualisieren

---

*Next.js 14 · Drizzle · PostgreSQL 16 · TypeScript strict · react-big-calendar · Hetzner · skicoach.mmind.space · 49.13.139.206*
