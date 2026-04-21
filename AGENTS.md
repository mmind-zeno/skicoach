# skicoach — Agent & Session-Start

Diese Datei ist der **Einstieg für jede neue Session** (KI oder Mensch): zuerst hier orientieren, dann die verlinkten Dateien.

## Workspace öffnen (empfohlen)

**`skicoach-second-brain.code-workspace`** im Repo-Root öffnen (nicht nur den Ordner). Enthält:

- dieses Repo **skicoach**
- **Obsidian-Vault** `c:/_DATA/600_github/obsidian-secondBrain` — damit Regeln, Suche und `knowledge/projects/skicoach.md` ohne Pfad-Rätsel verfügbar sind.

Ohne Vault: `skicoach.code-workspace` oder Ordner `skicoach` öffnen; Vault-Wissen dann bei Bedarf manuell einbeziehen.

---

## Reihenfolge: was zuerst lesen

| # | Datei | Zweck |
|---|--------|--------|
| 1 | **Diese `AGENTS.md`** | Orientierung |
| 2 | **`skicoachDraft/CLAUDE.md`** | Stack, Architektur, APIs, Konventionen, Design (maßgeblich bei Widersprüchen) |
| 3 | **`knowledge/projects/skicoach.md`** (Vault) | Aktueller Release, zuletzt gearbeitet, offene Punkte — **nur wenn Vault im Workspace** |
| 4 | **`README.md`** | Kurzüberblick Repo, lokaler Start, Produktion |
| 5 | **`skicoachDraft/DEPLOY.md`** | Deploy-Details Server/Caddy |
| 6 | **`skicoachDraft/STITCH_DESIGN_PROMPT.md`** | Stitch/MCP-Designbrief, optional |

Kurzreferenz nur für Agenten: **`skicoachDraft/AGENTS.md`** (verweist auf `CLAUDE.md`).

**Cursor-Regeln:** `.cursor/rules/` — u. a. Second Brain (Retrieval/Rückschreiben ins Vault).

---

## Lokal starten (Webapp)

```powershell
cd webapp
copy ..\.env.example .env.local
# .env.local anpassen (DATABASE_URL, NEXTAUTH_*, …)
npm install
npm run dev
```

App läuft über **`server.ts`** (Next + Socket.io), Port siehe Konsole.

Weitere Skripte: `webapp/package.json` (`db:generate`, `db:push`, `build`, …).

---

## Version & Health

- **Version:** `webapp/package.json` → `NEXT_PUBLIC_APP_VERSION` (Build/Compose siehe `docker-compose.yml`, `webapp/Dockerfile`).
- **Health:** `GET /api/public/health` — Feld `version`.

---

## Deploy (Produktion)

Aus **Repo-Root** (Windows, SSH-Key üblich `~/.ssh/ssh-kimai-zeno`):

```powershell
.\deploy-local.ps1 -RemoteUp
```

Ziel: `root@49.13.139.206:/opt/skicoach` — Details **`skicoachDraft/DEPLOY.md`**, Domain **`skicoach.mmind.space`**.

---

## Wichtige Pfade

| Pfad | Inhalt |
|------|--------|
| `webapp/` | Next.js-App, Drizzle, `server.ts` |
| `webapp/src/features/` | Feature-Module (Kalender, Gäste, …) |
| `skicoachDraft/` | Spezifikation, Prompts, `CLAUDE.md` |
| `docker-compose.yml` | App + Postgres + Backup |

---

## Nach größeren Änderungen

Vault pflegen: **`knowledge/projects/skicoach.md`** und ggf. `daily/YYYY-MM-DD.md` — Schema siehe **`obsidian-secondBrain/AGENTS.md`**. Details: Cursor-Regel **Second Brain** (`.cursor/rules/second-brain.mdc`).
