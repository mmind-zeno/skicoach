import assert from "node:assert/strict";
import { brand } from "../src/config/brand";
import { FetchJsonError } from "../src/lib/client-fetch";
import { getUiErrorInfo, getUiErrorMessage } from "../src/lib/client-error-message";

function run() {
  const limited = new FetchJsonError("HTTP 429", 429, {
    code: "RATE_LIMITED",
    requestId: "req_test_429",
  });
  assert.equal(
    getUiErrorMessage(limited, "fallback"),
    `${brand.labels.apiTooManyRequests} (Ref: req_test_429)`
  );
  const limitedInfo = getUiErrorInfo(limited, "fallback");
  assert.equal(limitedInfo.message, brand.labels.apiTooManyRequests);
  assert.equal(limitedInfo.requestId, "req_test_429");

  const unknownCode = new FetchJsonError("Server exploded", 500, {
    code: "SOMETHING_NEW",
    requestId: "req_test_500",
  });
  assert.equal(
    getUiErrorMessage(unknownCode, "fallback"),
    "Server exploded (Ref: req_test_500)"
  );

  const plainError = new Error("Local validation failed");
  assert.equal(
    getUiErrorMessage(plainError, "fallback"),
    "Local validation failed"
  );

  const nonError = { nope: true };
  assert.equal(getUiErrorMessage(nonError, "fallback"), "fallback");

  console.log("client-error-message checks passed");
}

run();
