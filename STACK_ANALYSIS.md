# Stack-Analyse: skicoach

> Stand: März 2026

## Was das Projekt wirklich ist

Kein einfaches Buchungstool — ein **vollständiges Operations-System** für eine Skischule:
- **Intern:** Kalender (15+ Lehrer), Gäste-CRM mit Timeline, Rechnungen (PDF/CHF/MwSt), Echtzeit-Team-Chat, Admin-Panel mit Audit-Log
- **Öffentlich:** 4-stufiger Buchungswizard mit Verfügbarkeitsberechnung, CAPTCHA, Bestätigungs-Mails

---

## Stack-Entscheide im Einzelnen

### PostgreSQL statt SQLite ✅ Richtige Wahl

Im Gegensatz zu `sendeklar` war PostgreSQL hier die einzig korrekte Entscheidung:

| Grund | Warum PostgreSQL notwendig |
|---|---|
| Distributed Rate Limiting | `rateLimitBuckets` Tabelle → braucht shared DB-State |
| Socket.io + gleichzeitige Writes | Chat, Buchungen, Verfügbarkeit — alles parallel |
| 14 Tabellen, komplexe Relationen | JOINs über Booking → Teacher → Guest → Invoice |
| Automatische DB-Backups | `pg_dump` im Docker-Compose (7-Tage-Retention) |
| Verfügbarkeits-Algorithmus | Iteriert 30-min Slots über alle Lehrer gleichzeitig |

SQLite hätte hier konkrete Write-Lock-Probleme produziert.

---

### Next.js 14 App Router ✅ Gute Wahl

Für dieses Projekt besser begründet als in reinen Dashboards:
- Das öffentliche Buchungsportal (`/buchen`) profitiert von SSR (erster Load ohne JS-Hydration)
- Separierte Route Groups `(internal)` / `(public)` sind sauber strukturiert
- API Routes, Auth und Pages im selben Repo ohne Extra-Deployment

---

### NextAuth.js v5 (Magic Link) ⚠️ Funktioniert, aber mit Risiken

**Warum Magic Link für diesen Kontext Sinn macht:**
- 15 Skilehrer ohne IT-Erfahrung → kein Passwort-Reset-Support-Aufwand
- Admin kann Lehrer per Link einladen ohne separaten Onboarding-Flow

**Was dagegen spricht:**

| Problem | Detail |
|---|---|
| **v5 ist Beta/RC** | Breaking Changes möglich, nicht production-stable (v4 ist LTS) |
| **Täglicher Login umständlich** | Lehrer müssen jeden Morgen auf Mail-Link klicken |
| **Mail-Abhängigkeit** | Resend-Ausfall = niemand kann einloggen |
| **Duale Magic-Link-Logik** | Normale Auth + Invite-Magic-Link mussten getrennt implementiert werden |

Better-Auth mit Email/Passwort wäre für tägliche Nutzer ergonomischer gewesen.

---

### Socket.io für Team-Chat ⚠️ Überdimensioniert

Socket.io erzwingt einen **Custom Node Server** (`server.ts`) — das ist der grösste Komplexitäts-Treiber im Projekt:

```
Normales Next.js  →  next start  (einfach)
Mit Socket.io     →  custom server.ts (Next + Socket.io auf Port 3000)
                     Reverse-Proxy muss WebSocket passieren
                     Kein Serverless, kein Vercel-Deploy möglich
                     Separate Auth-Logik für WS-Verbindungen
```

Für eine Skischule mit ~15 Lehrern wäre **SWR-Polling alle 5s** funktional identisch gewesen — ohne den Custom-Server-Overhead. Der im Code vorhandene Fallback (`SWR polling if server.ts not running`) zeigt, dass die App ohne Echtzeit vollständig funktioniert.

---

### react-big-calendar + @react-pdf/renderer ✅ Richtige Tools

Keine sinnvollen Alternativen für diese spezifischen Anforderungen. PDF-Generierung serverseitig mit `@react-pdf/renderer` ist der Standardansatz in Next.js.

---

### Cloudflare Turnstile ✅ Sinnvoll

Für ein öffentliches Buchungsformular korrekte Wahl gegenüber reCAPTCHA — Spam-Schutz ohne Nutzererfahrungs-Einbussen.

---

## Gesamtbewertung

```
Stack-Entscheid              Bewertung   Begründung
─────────────────────────────────────────────────────────────────
PostgreSQL                   ✅          Einzige richtige Wahl für diesen Use-Case
Next.js 14                   ✅          SSR + vereintes Deployment gerechtfertigt
react-big-calendar           ✅          Kein besseres Open-Source-Alternativ
@react-pdf/renderer          ✅          Standard für Next.js PDF
Cloudflare Turnstile         ✅          Besser als reCAPTCHA
NextAuth.js v5 (Magic Link)  ⚠️          Beta-Risiko + für tägliche Nutzer umständlich
Socket.io für Chat           ⚠️          Erzwingt Custom Server für nice-to-have Feature
```

**Fazit:** Der Stack ist insgesamt **gut gewählt und der Aufgabe angemessen**. Keine fundamentalen Fehler. Im Vergleich zu `sendeklar` (SQLite-Risiko) sind die kritischen Entscheide hier solider.

Die zwei Schwachpunkte sind kein Blocker, aber relevant für die Wartung:
1. **NextAuth v5 Beta** → Migrationsrisiko bei Breaking Changes vor finalem Release
2. **Socket.io** → Hätte Custom-Server-Overhead gespart; SWR-Polling wäre für 15 Lehrer ausreichend
