import { brand } from "@/config/brand";
import {
  getApiErrorCode,
  getApiErrorRequestId,
  getErrorMessage,
} from "@/lib/client-fetch";

const CODE_TO_MESSAGE: Record<string, string> = {
  RATE_LIMITED: brand.labels.apiTooManyRequests,
  INVALID_INPUT: brand.labels.apiInvalidData,
  UNAUTHORIZED: brand.labels.apiUnauthorized,
  FORBIDDEN: brand.labels.apiForbidden,
  NOT_FOUND: brand.labels.apiNotFound,
  USER_EXISTS: brand.labels.apiAdminUserExists,
  DB_SCHEMA_DRIFT: brand.labels.apiDbSchemaColumnDrift,
  INTERNAL_ERROR: brand.labels.apiTechnicalErrorGeneric,
};

export type UiErrorInfo = {
  message: string;
  requestId?: string;
};

export function getUiErrorInfo(e: unknown, fallback: string): UiErrorInfo {
  const code = getApiErrorCode(e);
  const message =
    (code && CODE_TO_MESSAGE[code]) || getErrorMessage(e, fallback);
  const requestId = getApiErrorRequestId(e);
  return { message, requestId };
}

export function getUiErrorMessage(e: unknown, fallback: string): string {
  const info = getUiErrorInfo(e, fallback);
  return info.requestId ? `${info.message} (Ref: ${info.requestId})` : info.message;
}
