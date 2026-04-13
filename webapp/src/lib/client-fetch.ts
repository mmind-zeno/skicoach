/**
 * Browser-seitige API-Aufrufe: Session-Cookie, Status prüfen, JSON parsen.
 * Bei **204 No Content** oder leerem Body liefert die Funktion `null` als `T`
 * (z. B. nach DELETE).
 */

export class FetchJsonError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown = undefined
  ) {
    super(message);
    this.name = "FetchJsonError";
  }
}

type ApiErrorBody = {
  error?: unknown;
  code?: unknown;
  requestId?: unknown;
};

function readApiErrorBody(e: unknown): ApiErrorBody | null {
  if (!(e instanceof FetchJsonError)) return null;
  if (!e.body || typeof e.body !== "object") return null;
  return e.body as ApiErrorBody;
}

export function getApiErrorCode(e: unknown): string | undefined {
  const body = readApiErrorBody(e);
  return typeof body?.code === "string" ? body.code : undefined;
}

export function getApiErrorRequestId(e: unknown): string | undefined {
  const body = readApiErrorBody(e);
  return typeof body?.requestId === "string" ? body.requestId : undefined;
}

export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message.trim()) return e.message;
  return fallback;
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "same-origin",
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) {
      throw new FetchJsonError(
        text.trim().slice(0, 200) || `HTTP ${res.status}`,
        res.status
      );
    }
    throw new FetchJsonError(`HTTP ${res.status}`, res.status);
  }

  if (!res.ok) {
    const msg =
      parsed &&
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : `HTTP ${res.status}`;
    throw new FetchJsonError(msg, res.status, parsed);
  }

  return parsed as T;
}
