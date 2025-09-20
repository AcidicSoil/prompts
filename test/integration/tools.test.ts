import { strict as assert } from "node:assert";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { secureLogger } from "../../src/logger.ts";
import { createServer } from "../../src/index.ts";
import { registerPromptResources, registerPromptTools } from "../../src/prompts/register.ts";

const run = async () => {
  const server = createServer();
  await registerPromptResources(server, secureLogger, { baseDir: process.cwd() });
  await registerPromptTools(server, secureLogger, { baseDir: process.cwd() });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({
    name: "tool-test-client",
    version: "1.0.0",
  });
  await client.connect(clientTransport);

  try {
    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    for (const expected of [
      "instruction-file",
      "planning-process",
      "scope-control",
      "integration-test",
      "regression-guard",
      "release-notes",
    ]) {
      assert.ok(toolNames.includes(expected), `Expected tool ${expected}`);
    }

    const result = await client.callTool({
      name: "instruction-file",
      arguments: {},
    });
    const contentItems = Array.isArray(result.content) ? result.content : [];
    const [content] = contentItems;
    assert.ok(content && content.type === "text");
    const text = content.text;
    assert.ok(text.includes("Instruction File"));
    assert.ok(text.includes("Served via MCP prompt tool"));
  } finally {
    await client.close();
    await server.close();
    await clientTransport.close();
    await serverTransport.close();
  }
};

run()
  .then(() => {
    console.log("integration prompt tools tests passed.");
  })
  .catch((error) => {
    console.error("integration prompt tools tests failed:", error);
    process.exitCode = 1;
  });
