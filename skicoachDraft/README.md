# skicoach — Draft / Spezifikation

Die **laufende App** liegt im **übergeordneten Ordner**: `../webapp/`, **Docker/Deploy** im Repo-Root (`../docker-compose.yml`, `../deploy-local.ps1`).

- **`CLAUDE.md`** — Architektur- und Produktregeln  
- **`PROMPTS.md`** — Implementierungsreihenfolge (Claude Code / IDE)  
- **`DEPLOY.md`** — Deploy **49.13.139.206**, Caddy + n8n  
- **`docker-compose.yml`** (hier) — **Kopie/Referenz**; führend ist **`../docker-compose.yml`** (context `./webapp`)  
- **`caddy-skicoach.caddyfile`**, **`nginx-skicoach.conf`**, **`Dockerfile`** — Referenz; Produktion nutzt **`../webapp/Dockerfile`**  
- **`scaffold.sh`** — optional für reine Struktur-Hilfe  

**Produkt-URL:** `https://skicoach.mmind.space` · **Server:** `49.13.139.206`
