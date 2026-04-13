import assert from "node:assert/strict";
import { AppError } from "../src/lib/errors";
import { apiErrorResponse } from "../src/lib/api-error";

async function readBody(res: Response) {
  return (await res.json()) as {
    error: string;
    code?: string;
    requestId?: string;
  };
}

async function run() {
  const appErr = apiErrorResponse(
    new AppError("Forbidden", 403, "FORBIDDEN"),
    "test/app",
    { requestId: "req_test_1" }
  );
  assert.equal(appErr.status, 403);
  const appErrBody = await readBody(appErr);
  assert.equal(appErrBody.code, "FORBIDDEN");
  assert.equal(appErrBody.requestId, "req_test_1");

  const zodLike = apiErrorResponse(new Error("bad"), "test/zod-off", {
    requestId: "req_test_2",
  });
  assert.equal(zodLike.status, 500);
  const fallbackBody = await readBody(zodLike);
  assert.equal(fallbackBody.code, "INTERNAL_ERROR");
  assert.equal(fallbackBody.requestId, "req_test_2");

  console.log("api-error checks passed");
}

void run();
