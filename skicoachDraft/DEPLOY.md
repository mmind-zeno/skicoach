# Deploy — skicoach (Hetzner, wie aiact / Forklore)

**Produktion:** `https://skicoach.mmind.space`  
**Server:** `49.13.139.206` — **DNS A-Record** der Subdomain auf diese IP setzen.

**Muster (Skills):** App-Container nur **`127.0.0.1:HOST_APP_PORT`** (Default **3002**), **kein** Bind von 80/443 im Skicoach-Compose. TLS + Weiterleitung über den **Host-Reverse-Proxy**.

**Koexistenz:** Auf diesem Host laufen **n8n + Caddy** (u. a.). **n8n-Stack nicht ändern** — Skicoach bekommt nur einen **zusätzlichen `skicoach.mmind.space`-Block** in Caddy (`caddy-skicoach.caddyfile`). Port **3002** vorher prüfen (`ss -tlnp`); bei Konflikt `HOST_APP_PORT` in `.env` **und** Caddy-Block anpassen.

---

## Performance (49.13.139.206)

Messung (Planung): **~7,5 GiB RAM**, **~6,7 GiB** `available`, **4 vCPU**, geringe Load; bereits **n8n, Caddy, Qdrant**. Skicoach (+ Postgres) addiert typisch **~0,5–1,5 GiB** — hier **unkritisch**.

**Vergleich alter Multi-App-Server (`195.201.145.97`):** ~3,7 GiB RAM, viele Apps — dort war Skicoach eher knapp. Produktion ist **bewusst auf 49.13…** ausgelagert.

---

## SSH

Zugang z. B. mit Key **`ssh-kimai-zeno`** (siehe Team-Doku). Optional `~/.ssh/config`:

```sshconfig
Host skicoach-server
    HostName 49.13.139.206
    User root
    IdentityFile ~/.ssh/ssh-kimai-zeno
    IdentitiesOnly yes
```

---

## Ablauf (Caddy auf dem Server)

1. **DNS:** `skicoach.mmind.space` → **`49.13.139.206`**.
2. **Port:** Auf dem Server prüfen, ob **`127.0.0.1:3002`** frei ist; sonst z. B. **3003** wählen und überall gleich setzen (`.env` + Caddy).
3. **Projekt** nach **`/opt/skicoach/`** deployen — Repo-Root-**`deploy-local.ps1`** legt **`webapp/`** + `docker-compose.yml` + **`.env.example`** (expliziter `scp`, da `*` Punktdateien auslässt) + `caddy-skicoach.caddyfile` ab (ohne `node_modules` / `.next`).
4. Server: **`cd /opt/skicoach && cp .env.example .env`**, Werte setzen (`NEXTAUTH_SECRET`, DB-Passwort, `RESEND_API_KEY`, `HOST_APP_PORT`, …). **Niemals** die Platzhalter aus `.env.example` dauerhaft in Produktion lassen.
5. **Release-Version:** steht in **`webapp/package.json`**; öffentlich sichtbar unter **`GET /api/public/health`** (`version`) und in der internen Sidebar (`v…`).
6. **Build & Start:**
   ```bash
   cd /opt/skicoach && docker compose down 2>/dev/null || true
   docker compose build --no-cache && docker compose up -d
   ```
7. **DB-Schema (erste Installation):** Im Produktions-Image ist **`drizzle-kit`** nach `npm prune` nicht enthalten. Initial-SQL z. B.:
   ```bash
   cd /opt/skicoach && docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" < webapp/drizzle/migrations/0000_init.sql
   ```
   (`DB_USER` / `DB_NAME` wie in `.env`.) Weitere Migrationen: lokal generieren und analog einspielen oder Image um ein Migrate-Target erweitern.
8. **Smoke-Test (auf dem Server):** `curl -s http://127.0.0.1:${HOST_APP_PORT}/api/public/health` → `ok: true`, `version` wie in `package.json`.
9. **Caddy:** Block für `skicoach.mmind.space` in die **bestehende** Host-Caddyfile einfügen (siehe **`caddy-skicoach.caddyfile`** im Repo).
   - Läuft Caddy **im Docker-Container** (z. B. `n8n-caddy-1`): `docker-compose.yml` muss den **App**-Dienst ins Netzwerk **`n8n_default`** hängen (`n8n_proxy` im Compose), und der Upstream in Caddy ist **`skicoach_app:3000`** — **nicht** `127.0.0.1:3002` (vom Container aus nicht erreichbar; zudem fehlte ohne eigenen Site-Block TLS → `ERR_SSL_PROTOCOL_ERROR`).
   - Läuft Caddy **nativ auf dem Host**: Upstream `127.0.0.1:${HOST_APP_PORT}` wie in der älteren Doku.
   Dann **`docker exec n8n-caddy-1 caddy reload --config /etc/caddy/Caddyfile`** (Pfad/Containername anpassen).
10. **TLS:** Wenn Caddy bereits Let’s Encrypt nutzt, holt es Zertifikate für die neue Domain bei erstem erfolgreichen Request (sofern DNS stimmt).
11. Env geändert (`NEXTAUTH_URL`, …):
    ```bash
    cd /opt/skicoach && docker compose up -d --force-recreate
    ```

---

## Alternative: Nginx (z. B. Server `195.201.145.97`)

Wenn Skicoach doch auf einem Host mit **Nginx** läuft: **`nginx-skicoach.conf`** wie im Skill — `proxy_pass http://127.0.0.1:HOST_APP_PORT`, Certbot.

---

## Traefik-Variante

Nur sinnvoll auf einem Host **ohne** bestehenden Proxy auf 80/443:

```bash
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

**Nicht** auf 49.13.139.206 neben n8n-Caddy verwenden.

---

## Env

Siehe **`.env.example`** — `HOST_APP_PORT`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST=true`.
