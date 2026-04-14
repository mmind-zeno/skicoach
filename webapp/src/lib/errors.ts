import { brand } from "@/config/brand";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errorCode?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(message ?? brand.labels.apiUnauthorized, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(message ?? brand.labels.apiForbidden, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(message ?? brand.labels.apiNotFound, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message?: string) {
    super(message ?? brand.labels.apiValidationDefault, 400);
    this.name = "ValidationError";
  }
}

/** Drizzle o. ä. kann ValidationError in `cause` verpacken. */
export function unwrapValidationError(e: unknown): ValidationError | undefined {
  let cur: unknown = e;
  for (let i = 0; i < 12 && cur != null; i++) {
    if (cur instanceof ValidationError) return cur;
    if (cur instanceof Error && cur.cause !== undefined) cur = cur.cause;
    else break;
  }
  return undefined;
}
