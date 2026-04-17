# skicoach

Skischule: interne Verwaltung + öffentliches Buchungsportal (Spezifikation in **`skicoachDraft/`**).

## Struktur

| Pfad | Inhalt |
|------|--------|
| **`webapp/`** | Next.js 14 App (Docker-Build, Drizzle, Prompts umsetzen) |
| **`skicoachDraft/`** | `CLAUDE.md`, `PROMPTS.md`, `DEPLOY.md` (Detail-Doku) |
| **`docker-compose.yml`** | App + Postgres + Backup → `127.0.0.1:HOST_APP_PORT` |
| **`caddy-skicoach.caddyfile`** | Snippet für Server mit Caddy (49.13.139.206, neben n8n) |
| **`deploy-local.ps1`** | Windows: Deploy nach `/opt/skicoach` |

## Lokal entwickeln

```powershell
cd webapp
copy ..\.env.example .env.local
# .env.local anpassen (DATABASE_URL zu lokaler Postgres)
npm run dev
```

Drizzle (nach Schema-Erweiterung):

```powershell
cd webapp
npm run db:generate
npm run db:push
```

## Produktion

Siehe **`skicoachDraft/DEPLOY.md`** — Server **49.13.139.206**, Domain **skicoach.mmind.space**, Caddy-Block einbinden, **`deploy-local.ps1`** aus Repo-Root (kopiert **`.env.example`** explizit mit).

**Release-Version:** `webapp/package.json` (aktuell 0.9.7) — optional `NEXT_PUBLIC_APP_VERSION` als Docker-Build-Arg; `GET /api/public/health` liefert `version`; App-Container führt beim Start `npm run db:migrate` aus (`docker-entrypoint.sh`).

**Gäste / kleines CRM:** unter `/gaeste` — Felder Firma & CRM-Quelle, Suche inkl. Telefon/Firma, Buchungsanzahl in der Liste, Kontakt-Timeline (Notiz, Anruf, E-Mail, Treffen) mit Autor; `POST /api/guests/:id/contacts`.

## Nächste Schritte (Implementierung)

`skicoachDraft/PROMPTS.md` ab **Prompt 2** (echtes DB-Schema ersetzt Platzhalter `app_meta`), dann Auth, Kalender, …
