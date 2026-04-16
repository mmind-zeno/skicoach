# AGENTS.md — Kurzreferenz für KI-Agenten (skicoach)

> Ergänzt **`CLAUDE.md`** im gleichen Ordner. **`CLAUDE.md` hat Vorrang** bei Widersprüchen (Architektur, Schichten, APIs).

## Zuerst lesen

1. **`skicoachDraft/CLAUDE.md`** — Stack, Middleware, DB, Konventionen, Design (Legacy + Ascent-Pilot).
2. **`skicoachDraft/STITCH_DESIGN_PROMPT.md`** — Stitch/MCP-Brief, optionale Bildprompts.
3. **Second Brain** (wenn Workspace mit Vault geöffnet): `obsidian-secondBrain/knowledge/projects/skicoach.md`.

## Aktueller Stand (kurz)

- **Version:** `webapp/package.json` (z. B. **0.9.5**); Runtime/Build: `NEXT_PUBLIC_APP_VERSION`.
- **Deploy:** Repo-Root `deploy-local.ps1 -RemoteUp` → `root@49.13.139.206:/opt/skicoach` (SSH-Key i. d. R. `~/.ssh/ssh-kimai-zeno`).
- **Ascent-Pilot:** `isLandingPilotEnabled()` / `NEXT_PUBLIC_LANDING_PILOT` — öffentlich `.landing-pilot`, intern `.app-ascent`, siehe `webapp/src/app/globals.css` und `webapp/src/lib/landing-pilot.ts`.

## Bei Session-Ende (auf User-Wunsch)

Projektgedächtnis im Vault und ggf. `daily/YYYY-MM-DD.md` aktualisieren — Schema: `obsidian-secondBrain/AGENTS.md`.
