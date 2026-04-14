#!/bin/sh
set -e
cd /app
# Produktion: Journal-SQL anwenden (zuverlässiger als drizzle-kit migrate in schmalen Docker-Logs).
npm run db:migrate:apply
exec node node_modules/tsx/dist/cli.mjs server.ts
