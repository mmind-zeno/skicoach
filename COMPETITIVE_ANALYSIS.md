# Wettbewerbsanalyse: skicoach

> Stand: März 2026

---

## Konkurrenzsituation – Realität

### Direkte Wettbewerber (bereits etabliert)

| Lösung | Stärken | Zielgruppe |
|---|---|---|
| **Eversports** | Tennis, Padel, Fitness — marktführend in DACH | Sporthallen, Studios |
| **Mindbody** | Vollständigste Lösung, Marketplace, App | Yoga, Fitness, Wellness |
| **Regiondo** | Tours & Aktivitäten, DE-Markt, Zahlungen | Skischulen, Outdoor |
| **Fareharbor** | Tours & Aktivitäten, grosse Reichweite | Skischulen, Guides |
| **SimplyBook.me** | Günstig, viele Branchen, fertig | Generisch |
| **Fresha** | Kostenlos, Beauty/Wellness | Kosmetik, Massage |
| **Acuity / Calendly** | Einfach, bekannt, günstig | Einzelpersonen |
| **Treatwell** | Marketplace + Software kombiniert | Beauty |

**Ski-spezifisch:**
- **Ski Booking** (skiibooking.com) — genau dieselbe Nische, bereits spezialisiert
- **Aspenware / Ikon** — Enterprise-Level für grosse Skigebiete

---

## Was skicoach heute fehlt

```
Feature                          skicoach   Wettbewerber
──────────────────────────────────────────────────────────
Online-Zahlung (Stripe/Twint)    ❌ Stub    ✅ Standard
Kunden-Account (Login, History)  ❌         ✅
Automatische Reminder (SMS/Mail) ❌         ✅
Kalender-Sync (Google/iCal)      ❌         ✅
Mobile Admin (Lehrer-App)        ❌         ✅
Gruppen-Buchungen                ❌         ✅
Pakete / 10er-Abos               ❌         ✅
Warteliste                       ❌         ✅
Mehrsprachigkeit                 ❌         ✅ (wichtig für Tourismus)
Bewertungen / Reviews            ❌         ✅
Marketplace-Sichtbarkeit         ❌         ✅
Analytics / Forecasting          ⚠️ basic   ✅
API / Webhooks                   ❌         ✅
```

---

## Fehlende Features nach Priorität

### P0 — Ohne diese Features ist die App nicht verkaufbar

**1. Online-Zahlung**
Stripe-Stub ist im Code vorhanden, aber nicht implementiert. Ohne Zahlung im Buchungsflow kauft kein Kunde eine SaaS-Lösung. Twint für den CH-Markt wäre zusätzlich ein echter Differenziator.

**2. Kunden-Account**
Gäste können heute nicht ihren Buchungsverlauf sehen, stornieren oder umbuchen. Das ist 2026 ein Grundfeature.

**3. Automatische Reminder**
Mail/SMS 24h vor dem Termin — reduziert No-Shows um 30–50%. Resend ist bereits integriert, fehlt nur die Cron-Logik.

**4. Mehrsprachigkeit**
Skischulen haben internationale Gäste. Eine App nur auf Deutsch ist im Tourismus ein K.O.-Kriterium. Minimum: DE + EN.

### P1 — Für Wettbewerbsfähigkeit notwendig

**5. Mobile-optimierter Admin**
Skilehrer sind nicht am Desktop. Das aktuelle Interface ist Desktop-first — Lehrer brauchen eine mobile Ansicht für ihren Tagesplan.

**6. Gruppen-Buchungen + Pakete**
Gruppenunterricht (4–6 Personen) ist das Hauptprodukt vieler Skischulen. Aktuell: 1 Gast pro Buchung. Zusätzlich: 5er- oder 10er-Kurs-Pakete mit Rabatt.

**7. Google Calendar / iCal Sync**
Lehrer wollen ihre Buchungen in ihrer eigenen Kalender-App sehen. Ohne das ist die Adoption schwierig.

### P2 — Differenzierung

**8. Twint-Integration (Schweiz-spezifisch)**
Kein anderer etablierter Anbieter hat Twint nativ integriert. Echter Differenziator gegenüber US-Lösungen wie Fareharbor.

**9. DSGVO/nDSG-Compliance als Feature**
Swiss/FL Data Residency — Daten auf Hetzner Schweiz, kein US-Cloud-Provider. Für B2B in der Schweiz ein Verkaufsargument.

**10. Bewertungssystem**
Gäste bewerten den Lehrer nach der Stunde → soziale Signale, bessere Lehrerzuteilung.

---

## Realistische Einschätzung

```
Frage                                Antwort
──────────────────────────────────────────────────────────────────
Ist skicoach heute konkurrenzfähig?  Nein — zu viele Basis-Features fehlen
Ist der technische Unterbau solide?  Ja — PostgreSQL, saubere Architektur
Gibt es eine realistische Nische?    Ja, aber eng
Aufwand für P0-Features komplett?    ~3–4 Wochen Vollzeit
```

---

## Die realistische Nische

Der einzige Bereich wo skicoach heute einen Vorteil hätte:

> **Kleine Schweizer/Liechtensteiner Skischulen (5–20 Lehrer) die eine selbst-gehostete, DSGVO-konforme Lösung wollen und keine monatlichen SaaS-Gebühren zahlen möchten.**

Für ein skalierbares Produkt bräuchte es P0 + P1 vollständig implementiert — dann wäre ein Markteintritt als günstiger, DACH-fokussierter Herausforderer zu Regiondo/Eversports realistisch.

---

## Weitere Branchen mit minimalem Anpassungsaufwand

| Branche | Aufwand | Bemerkung |
|---|---|---|
| Tennisschule / Golfschule | < 1 Tag | Nur Labels + Kurstypen |
| Surfschule / Kiteschule | < 1 Tag | Labels, saisonale Verfügbarkeit |
| Musikschule / Sprachschule | 1–3 Tage | Gruppen-Slots, Levels |
| Nachhilfeinstitut | 1–3 Tage | Fächer als Kurstypen |
| Fahrschule | 1–3 Tage | Fahrzeug als Ressource |
| Physiotherapie / Massage | 3–5 Tage | Datenschutz, Patientendaten |
