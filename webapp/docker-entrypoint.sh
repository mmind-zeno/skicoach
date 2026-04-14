#!/bin/sh
set -e
cd /app
# Produktion: Schema vor App-Start angleichen (Compose setzt DATABASE_URL).
npm run db:migrate
exec node node_modules/tsx/dist/cli.mjs server.ts
