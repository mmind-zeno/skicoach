# Google Stitch — Master-Prompt für **Skicoach**

Dieser Text ist als **ein zusammenhängender Prompt** für Stitch gedacht (z. B. `generate_screen_from_text` im MCP oder direkt in der Stitch-UI).**Wichtig:** Pro Aufruf ein **konkretes Ziel** wählen (z. B. „Desktop Kalender“ oder „Mobile Buchungs-Wizard Schritt 2“), den Master-Text aber immer mitsenden oder als **Projekt-Brief** im ersten Screen etablieren.

---

## Kurz-Anweisung für Tool-Nutzung (MCP)

- **`deviceType`:** `DESKTOP` für interne App (Sidebar, Kalender); `MOBILE` für öffentliches Portal (`/`, `/buchen`, Gastportal).
- **`modelId`:** `GEMINI_3_1_PRO` für komplexe Layouts, `GEMINI_3_FLASH` für schnelle Varianten.
- **`projectId`:** deine Stitch-Projekt-ID (ohne `projects/`-Präfix).

---

## Master-Prompt (vollständig einfügen)

```
Kontext — Produkt „Skicoach“
Du hast kreative Hoheit: Lege Farben, Typografie, Abstände und Stil selbst so fest, dass das Ergebnis für dieses Produkt **optimal** wirkt (Best Practices, WCAG, Markenpassung) — ohne vorgegebene Hex-Werte aus diesem Brief.

Skicoach ist eine Web-App für eine Skischule / Kursbetrieb: (1) öffentliches Buchungsportal ohne Login und (2) interner Team-Bereich nach Login. Sprache der Oberfläche: Deutsch (Schweiz/Liechtenstein). Ton: professionell, vertrauenswürdig, winterlich-modern, keine verspielte Comic-Ästhetik.

Öffentlicher Bereich (ohne Auth)
- Startseite mit Hero, CTAs „Kurs anfragen“, Link „Meine Termine“ (Gastportal per Magic-Link), Footer: Datenschutz, Impressum, Team-Login.
- /buchen: mehrstufiger Buchungs-Wizard (Kurstyp → Datum/Kalender → Slot → Kontaktdaten → Bestätigung), Hinweise zu Storno/Zahlung, barrierefreie Formulare (Labels, Fokuszustände, ausreichende Touch-Ziele).
- /buchen/meine-termine: Gastportal — Liste eigener Termine, Storno (mit Bestätigungs-Dialog-Konzept, kein natives alert), Rechnungs-PDF nur für eingeloggten Gastkontext.
- /wartung: schlichte Wartungsseite (optional im Flow).

Interner Bereich (nach Login, Lehrkräfte & Admins)
- Layout: linke Sidebar (Navigation), Hauptinhalt mit Cards, optional Topbar. Mobile: Sidebar als Drawer/Overlay.
- Hauptbereiche: Kalender (Woche/Tag/Monat, Event-Karten mit Status), Gäste-CRM, Rechnungen, Stundenreport, Lohnabrechnung, Chat (Kanäle + Direkt), Admin (Anfragen, Kurstypen, Nutzer, Audit).
- Kalender: Events mit Lehrer-Farbe, Gastname, Kurstyp, Zeit; Legende; Detail-Panel statt winzigem Popup wo möglich.

Technischer Stack (Design muss sich für Next.js + Tailwind umsetzen lassen)
- Frontend: Next.js 14 App Router, React, TypeScript, Tailwind CSS.
- Auth: NextAuth (Magic Link).
- Daten: PostgreSQL, Drizzle ORM.
- Kalender: react-big-calendar (deutsche Toolbar).
- Chat: Socket.io (Live/Polling-Hinweis im UI möglich).
- Deployment: Docker; öffentliche Domain-Beispiele skicoach.mmind.space — Designs müssen responsive und „production-ready“ wirken.

Design-System — von dir (Stitch) optimal festlegen
Du sollst aus deiner Erfahrung mit hochwertigen Produkt- und Dashboard-UI **das passende visuelle System selbst ermitteln** — Farben, Typografie, Abstände, Rundungen, Schatten, ggf. dezente Texturen oder Verläufe. **Keine vorgegebenen Hex-Codes**; wähle stattdessen eine **kohärente, markenfähige Palette**, die zum Kontext passt.

Leitplanken für deine Entscheidung (frei umsetzen, solange es stimmig bleibt):
- **Stimmung:** Alpin / Winter / Outdoor-Vertrauen, aber **seriös und buchungsorientiert** (B2C-Gast + B2B-Team), nicht verspielt, nicht billig-touristisch.
- **Öffentlicher Bereich:** einladend, ruhiger Hintergrund, **eine klare Primärfarbe** für „Kurs anfragen“ und kritische Schritte; Sekundär für Links und Vertrauenselemente.
- **Interner Bereich:** effizientes Arbeits-UI — Sidebar oder Navigation, **gute Lesbarkeit** lange Tabellen/Kalender; Akzentfarbe für Auswahl und Primary Actions; Statusfarben für Termine/Anfragen **unterscheidbar und WCAG-tauglich**.
- **Tiefe:** moderne Flächenhierarchie (z. B. angelehnt an Material 3 oder vergleichbares System): Surface-Stufen, Cards mit weichem Schatten oder sehr dezenten Grenzen, Inputs klar abgrenzbar (inkl. Fokuszustand).
- **Typografie:** wähle eine **professionelle Sans** (du darfst z. B. Inter, ähnliche Google-Fonts oder System-Stacks vorschlagen), mit klarer Skala: Display/Headline, Body, kleine Labels — **nicht** zu viele Schriftgrößen.
- **Form:** einheitliche Rundungen (ein Raster: z. B. 8/12/16px) und konsistente Button-Hierarchie (Primary / Secondary / Ghost / Destruktiv wo nötig).

Optional: Liefere in der **Design-Beschreibung** oder als **kurze Token-Liste** (Namen + Hex), damit Entwickler:innen später mappen können — das ist deine Empfehlung, keine Vorgabe aus dem Prompt.

Komponenten-Hinweise
- Status-Badges: „Geplant“, „Durchgeführt“, „Storniert“, „Offen“, „Bezahlt“, Buchungsanfrage „Neu/Bestätigt/Abgelehnt“ — jeweils eigene Pastell-Hintergründe mit gut lesbarem Kontrast (Orientierung: Blau/Grün/Grau/Violett/Amber wie in einer Business-App).
- Tabellen: zebra-light optional, klare Spaltenköpfe, Sticky-Header auf Desktop wenn sinnvoll.
- Öffentliche Navigation: Mobile-first, Safe-Area (Notch) berücksichtigen — etwas Luft links/rechts.

Barrierefreiheit & UX
- Kontrast **WCAG-orientiert** (AA wo möglich); Fokusring sichtbar und zur gewählten Palette passend.
- Touch-Ziele mindestens ~44–48px Höhe auf Mobile für primäre Aktionen.
- Keine Informationsübermittlung nur über Farbe; immer Text/Icon dazu.
- Skip-Link „Zum Inhalt springen“ auf öffentlichen Seiten vorsehen (visuell nur bei Fokus).

Was NICHT gewünscht ist
- Generische „AI-Slop“-Ästhetik (austauschbarer Lila-Pink-Gradient-Startup-Look ohne Bezug zu Skischule/Vertrauen/Buchung).
- Überladene Illustrationen oder Dekor, die den Buchungs- oder Arbeitsfluss überdecken.
- Grelle oder modische Paletten, die **Lesbarkeit** oder **Vertrauen** untergraben.

Konkrete Ausgabe-Erwartung für DIESEN Prompt
[ERSETZEN: z. B. „Erzeuge ein DESKTOP Hi-Fi Screen: interne Kalender-Wochenansicht mit Sidebar, Legende, einem ausgewählten Event-Detail-Panel rechts.“oder „Erzeuge ein MOBILE Hi-Fi Screen: Schritt 3 des Buchungs-Wizards (Slot-Auswahl) mit klarer Fortschrittsanzeige und Primary CTA unten.“]
Liefere ein kohärentes Layout, echte deutsche Beispieltexte (Platzhalter-Namen erlaubt), und markiere visuell die Primary Action auf dem kritischen Pfad.
```

---

## Screen-spezifische Zusatz-Sätze (an den Platzhalter anhängen)

| Screen | Zusatz |
|--------|--------|
| **Start (öffentlich)** | Hero mit winterlichem Foto-Platzhalter, zwei CTAs, kompakte Feature-Zeile, Footer-Links. |
| **Buchen Wizard** | Fortschritts-Indikator (4–5 Schritte), konsistente „Zurück/Weiter“-Leiste, Fehlerzustände unter Feldern. |
| **Gastportal** | Liste mit nächstem Termin hervorgehoben, sekundäre Aktion „Storno“, Link „Anfrage stellen“. |
| **Login Team** | Magic-Link-E-Mail-Feld, ruhige Erklärung, Link zurück zur Startseite. |
| **Kalender intern** | Toolbar „Heute / Vor / Zur“, Ansichts-Umschalter, Admin-Hinweis „Alle Lehrer“. |
| **Gäste-CRM** | Suchfeld, Tabelle mit Niveau-Spalte, Eintrag öffnet Detail mit Kontakt-Timeline. |
| **Admin Anfragen** | Inbox mit Status-Filtern, Zeile mit „Bestätigen / Ablehnen“. |

---

## Abgleich mit dem Code (nach dem Design)

Die laufende App nutzt aktuell feste Tokens in `webapp/src/lib/colors.ts` und `webapp/src/app/globals.css`. **Dieser Prompt zwingt keine Übereinstimmung** — Ziel ist zuerst ein **überzeugendes Stitch-Design**. Beim Implementieren in Tailwind werden Farben und Abstände **von den Entwickler:innen an dein Ergebnis angeglichen** (oder du dokumentierst am Ende eine kompakte Token-Tabelle als Referenz).

---

## KI-Bildbriefe (optional, für eigene Assets)

Wenn du **eigene** Hintergrundbilder erzeugen willst (z. B. Imagen, Midjourney, Flux), halte dich an diese Vorgaben — **ohne Text im Bild**, **ohne Logos**, für **Web-Hero** geeignet (Querformat, viel Himmel/Freifläche links für Textoverlay).

| Verwendung | Exakter Bildauftrag (engl. Prompt empfiehlt sich für viele Modelle) |
|------------|----------------------------------------------------------------------|
| **Startseite Hero** | Photorealistic alpine landscape at sunrise, sharp snow-covered mountain peaks rising above a soft cloud inversion layer, cold blue hour light, clear sky, no people, no ski lifts, no buildings, ultra wide 16:9, negative space on the left third for UI text, natural colors, high dynamic range, crisp detail |
| **Buchungsseite /buchen** (optional, derzeit nur Farbverlauf) | Soft abstract alpine atmosphere, very subtle snow texture and cool blue-white gradient, minimal, no recognizable peaks, no text, calm editorial background for a booking app, 16:9, light and airy |
| **Gastportal „Meine Termine“** (optional) | Cozy but professional winter sports mood: shallow depth of field, blurred gentle snowfall, hint of ski slope bokeh, cool tones, no readable signs, no faces, 16:9, calm and trustworthy |

**Technisch:** Ausgabe mind. **2400×1350** px oder größer; **JPEG oder WebP**; keine übermäßige Sättigung; Kontrast nicht extrem (Overlay im UI hell).
