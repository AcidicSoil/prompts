import { strict as assert } from "node:assert";

import { describe, test } from "@jest/globals";

import { capPayload, redactSecrets } from "./safety.ts";

describe("safety utilities", () => {
  test("redactSecrets removes sensitive fields without mutating input", () => {
    const sensitiveInput = {
      apiKey: "12345",
      nested: {
        SECRET_TOKEN: "abcd",
      },
      safe: "value",
    };

    const sensitiveResult = redactSecrets(sensitiveInput) as typeof sensitiveInput;
    assert.notStrictEqual(sensitiveResult, sensitiveInput);
    assert.equal(sensitiveResult.apiKey, "[redacted]");
    assert.equal(sensitiveResult.nested.SECRET_TOKEN, "[redacted]");
    assert.equal(sensitiveResult.safe, "value");
    assert.equal(sensitiveInput.apiKey, "12345");
    assert.equal(sensitiveInput.nested.SECRET_TOKEN, "abcd");

    const arrayInput = [
      { token: "secret" },
      {
        list: [
          { key: "value" },
          { inner: { authToken: "hidden" } },
        ],
      },
    ];
    const arrayResult = redactSecrets(arrayInput) as typeof arrayInput;
    const firstItem = arrayResult[0] as unknown as Record<string, string>;
    assert.equal(firstItem.token, "[redacted]");
    const nestedWrapper = arrayResult[1] as unknown as { list: Array<Record<string, any>> };
    const nestedList = nestedWrapper.list;
    assert.equal(nestedList[0].key, "[redacted]");
    const inner = nestedList[1].inner as Record<string, string>;
    assert.equal(inner.authToken, "[redacted]");
    const originalFirst = arrayInput[0] as unknown as Record<string, string>;
    assert.equal(originalFirst.token, "secret");

    assert.equal(redactSecrets("plain"), "plain");
    assert.equal(redactSecrets(42), 42);
  });

  test("capPayload truncates payloads with trailing metadata", () => {
    const smallPayload = "small";
    assert.equal(capPayload(smallPayload, 10), smallPayload);

    const payload = "a".repeat(200);
    const limit = 64;
    const truncated = capPayload(payload, limit);
    assert.equal(Buffer.byteLength(truncated, "utf8"), limit);
    const truncatedNote = truncated.match(/\[truncated (\d+) bytes\]$/);
    assert.ok(truncatedNote);
    const truncatedCount = Number(truncatedNote?.[1] ?? "0");
    assert.ok(truncatedCount > 0);

    const snowman = "\u2603";
    const multiByte = snowman.repeat(10);
    const multiLimit = 26;
    const capped = capPayload(multiByte, multiLimit);
    const noteMatch = capped.match(/\[truncated (\d+) bytes\]$/);
    assert.ok(noteMatch);
    assert.ok(Buffer.byteLength(capped, "utf8") <= multiLimit);
    const multiCount = Number(noteMatch?.[1] ?? "0");
    assert.ok(multiCount > 0);

    const tinyLimit = 8;
    const tiny = capPayload(payload, tinyLimit);
    assert.ok(Buffer.byteLength(tiny, "utf8") <= tinyLimit);

    const preciseLimit = 40;
    const precisePayload = "b".repeat(preciseLimit + 15);
    const preciseResult = capPayload(precisePayload, preciseLimit);
    assert.equal(Buffer.byteLength(preciseResult, "utf8"), preciseLimit);
    const preciseMatch = preciseResult.match(/\[truncated (\d+) bytes\]$/);
    assert.ok(preciseMatch);
    const truncatedBytesMeasured = Number(preciseMatch?.[1] ?? "0");
    const prefix = preciseResult.slice(0, preciseResult.length - (preciseMatch?.[0].length ?? 0));
    const prefixBytes = Buffer.byteLength(prefix, "utf8");
    const expectedTruncated = Buffer.byteLength(precisePayload, "utf8") - prefixBytes;
    assert.equal(truncatedBytesMeasured, expectedTruncated);
  });
});
