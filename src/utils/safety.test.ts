import assert from "node:assert/strict";

import { capPayload, redactSecrets } from "./safety.ts";

const runTests = () => {
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
  assert.equal((arrayResult[0] as Record<string, string>).token, "[redacted]");
  const nestedList = (arrayResult[1] as { list: Array<Record<string, string>> }).list;
  assert.equal(nestedList[0].key, "[redacted]");
  assert.equal(nestedList[1].inner.authToken, "[redacted]");
  assert.equal((arrayInput[0] as Record<string, string>).token, "secret");

  assert.equal(redactSecrets("plain"), "plain");
  assert.equal(redactSecrets(42), 42);

  const smallPayload = "small";
  assert.equal(capPayload(smallPayload, 10), smallPayload);

  const payload = "a".repeat(200);
  const limit = 64;
  const truncated = capPayload(payload, limit);
  assert.ok(Buffer.byteLength(truncated, "utf8") <= limit);
  assert.ok(truncated.endsWith("[truncated 136 bytes]"));

  const snowman = "\u2603";
  const multiByte = snowman.repeat(10);
  const multiLimit = 80;
  const capped = capPayload(multiByte, multiLimit);
  const noteMatch = capped.match(/\[truncated (\d+) bytes\]$/);
  assert.ok(noteMatch);
  assert.ok(Buffer.byteLength(capped, "utf8") <= multiLimit);

  const tinyLimit = 8;
  const tiny = capPayload(payload, tinyLimit);
  assert.ok(Buffer.byteLength(tiny, "utf8") <= tinyLimit);
};

try {
  runTests();
  console.log("safety utilities tests passed.");
} catch (error) {
  console.error("Safety utility tests failed:", error);
  process.exitCode = 1;
}
