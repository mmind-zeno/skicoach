# Brand / Fork – Roadmap & Status

Zentrale Konfiguration: `webapp/src/config/brand.ts` · Anleitung: `FORKING.md` · Env: `.env.example`.

## Erledigt (Stand laufende Umsetzung)

- Login-Seite: Texte über `brand.labels.login*`
- `mail.ts`: Fehler bei fehlendem Resend-Key über `brand`
- Chat-Composer-Placeholder: `chatComposerPlaceholder`
- Admin-New-Request-Toast: Schließen → `uiClose`
- Gäste: CRM-Placeholder, Auswahl-Hinweis, Kalender-Hinweis
- Buchungsmodal: Warn- und Titeltexte über Templates
- Öffentlicher Wizard: Schritt-1-Überschrift + Validierungstext als Template
- Gäste-Detail: Buchungsstatus als `StatusBadge`, Sprache-Placeholder, Kontakt-Textarea-Placeholder vereinheitlicht

## Noch sinnvoll (mittlere / niedrige Priorität)

| Bereich | Was |
|--------|-----|
| **E-Mail-Inhalte** | `mail.ts` / `auth-email-templates.ts`: lange HTML-Fließtexte optional in `brand` oder eigene `email*` Keys |
| **FORKING.md** | Neue Label-Gruppen (`login*`, `bookingModal*`, …) kurz auflisten |
| **Datenschutz / Impressum** | Echte Texte statt Platzhalter |
| **Scripts** | `seed.ts`, Admin-Bootstrap, `drizzle.config` – Domains & E-Mails |
| **API** | Optional deutsch statt `Unauthorized`/`Forbidden` in `brand` |
| **i18n** | EN-Fork: `date-fns`-Locale + `html lang` systematisch |

## Umsetzungsreihenfolge (Empfehlung)

1. Produktivtexte & Rechtliches vor Go-Live  
2. E-Mail-Bodies zentralisieren (wenn Forks häufig anpassen)  
3. Doku in `FORKING.md` nachziehen  
4. Scripts/Infra pro Deployment  
