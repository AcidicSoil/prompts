import { strict as assert } from "node:assert";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { secureLogger } from "../../src/logger.ts";
import { createServer } from "../../src/index.ts";
import { registerPromptResources } from "../../src/prompts/register.ts";

const run = async () => {
  const server = createServer();
  await registerPromptResources(server, secureLogger);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);

  const client = new Client({
    name: "resource-test-client",
    version: "1.0.0",
  });

  await client.connect(clientTransport);

  try {
    const result = await client.listResources();
    const resourceNames = result.resources.map((resource) => resource.name);

    const expected = [
      "instruction-file",
      "planning-process",
      "scope-control",
      "integration-test",
      "regression-guard",
      "release-notes",
    ];

    for (const name of expected) {
      assert.ok(resourceNames.includes(name), `Expected resource ${name} to be registered`);
    }

    const releaseNotes = result.resources.find((resource) => resource.name === "release-notes");
    assert.ok(releaseNotes);
    assert.equal(releaseNotes?.uri.startsWith("file://"), true);
    const meta = (releaseNotes?._meta ?? {}) as Record<string, unknown>;
    assert.equal(typeof meta.contentPreview, "string");
    assert.equal(meta.phase, "P7 Release & Ops");
  } finally {
    await client.close();
    await server.close();
    await clientTransport.close();
    await serverTransport.close();
  }
};

run()
  .then(() => {
    console.log("integration resource tests passed.");
  })
  .catch((error) => {
    console.error("integration resource tests failed:", error);
    process.exitCode = 1;
  });
