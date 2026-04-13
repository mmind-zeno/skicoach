# API Error Codes

Diese Referenz beschreibt das standardisierte Fehlerformat der API.

## Response-Format

Bei Fehlern liefert die API (soweit migriert) folgendes JSON:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "requestId": "req_..."
}
```

Zusätzlich wird der Header `x-request-id` gesetzt.

## Standard-Codes

- `INVALID_INPUT` – ungültige Eingabedaten (z. B. Schema/Parameter).
- `UNAUTHORIZED` – nicht angemeldet.
- `FORBIDDEN` – angemeldet, aber keine Berechtigung.
- `NOT_FOUND` – Ressource nicht gefunden.
- `CONFLICT` – Konflikt mit aktuellem Zustand.
- `RATE_LIMITED` – Rate-Limit erreicht.
- `DB_SCHEMA_DRIFT` – Datenbankschema passt nicht zur App-Version.
- `INTERNAL_ERROR` – unerwarteter Serverfehler.

## Spezifische Codes

- `USER_EXISTS` – Einladung/Erstellung fehlgeschlagen, weil Nutzer bereits existiert.

## Frontend-Empfehlung

1. Primär auf `code` reagieren (nicht auf `error`-Text).
2. `requestId` in Fehlertoast/Support-UI anzeigen.
3. Bei `INTERNAL_ERROR` und `DB_SCHEMA_DRIFT` generischen UI-Text anzeigen, Details nur serverseitig loggen.
4. Für konsistente Texte den zentralen Helper `getUiErrorMessage(...)` aus `src/lib/client-error-message.ts` verwenden.
