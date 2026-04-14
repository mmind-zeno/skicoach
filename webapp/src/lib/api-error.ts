import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import {
  genericApiErrorMessage,
  isDbSchemaDriftMessage,
} from "@/lib/map-db-error";

type ApiErrorOptions = {
  badRequestMessage?: string;
  handleZod?: boolean;
  fallbackMessage?: string;
  badRequestCode?: string;
  requestId?: string;
  request?: Request;
};

function resolveRequestId(requestId?: string, request?: Request): string {
  if (requestId && requestId.trim().length > 0) return requestId;
  const headerId =
    request?.headers.get("x-request-id") ??
    request?.headers.get("x-correlation-id");
  if (headerId && headerId.trim().length > 0) return headerId.trim();
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}`;
  }
}

function statusToCode(status: number): string {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  return "INTERNAL_ERROR";
}

export function apiClientError(
  message: string,
  status = 400,
  code?: string,
  requestId?: string,
  request?: Request
) {
  const id = resolveRequestId(requestId, request);
  return NextResponse.json(
    { error: message, code: code ?? statusToCode(status), requestId: id },
    { status, headers: { "x-request-id": id } }
  );
}

export function apiErrorResponse(
  e: unknown,
  context: string,
  options?: ApiErrorOptions
) {
  const requestId = resolveRequestId(options?.requestId, options?.request);

  if (e instanceof AppError) {
    return NextResponse.json(
      {
        error: e.message,
        code: e.errorCode ?? statusToCode(e.statusCode),
        requestId,
      },
      { status: e.statusCode, headers: { "x-request-id": requestId } }
    );
  }
  if (options?.handleZod && e instanceof ZodError) {
    return NextResponse.json(
      {
        error: options.badRequestMessage ?? "Invalid input",
        code: options.badRequestCode ?? "INVALID_INPUT",
        requestId,
      },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }
  console.error(`[${context}]`, e);
  const msg = options?.fallbackMessage ?? genericApiErrorMessage(e);
  const code = isDbSchemaDriftMessage(msg) ? "DB_SCHEMA_DRIFT" : "INTERNAL_ERROR";
  return NextResponse.json(
    { error: msg, code, requestId },
    { status: 500, headers: { "x-request-id": requestId } }
  );
}
