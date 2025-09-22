import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, test } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { secureLogger } from "../../src/logger.ts";
import { createServer } from "../../src/server.ts";
import { registerPromptResources, registerPromptTools } from "../../src/prompts/register.ts";
import { StateStore } from "../../src/state/StateStore.ts";
import { registerWorkflowTools } from "../../src/tools/register.ts";

describe("prompt and workflow tools", () => {
  test("register tools and serve content over MCP", async () => {
    const server = createServer();
    await registerPromptResources(server, secureLogger, { baseDir: process.cwd() });
    await registerPromptTools(server, secureLogger, { baseDir: process.cwd() });

    const projectRoot = await mkdtemp(join(tmpdir(), "mcp-tools-"));
    const stateStore = new StateStore(projectRoot);
    await stateStore.load();
    registerWorkflowTools(server, secureLogger, { stateStore });

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
        "refresh_metadata",
        "export_task_list",
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

      const advanceResult = await client.callTool({
        name: "advance_state",
        arguments: {
          id: "instruction-file",
          outputs: { status: "ok" },
          artifacts: [
            {
              name: "release_notes_context",
              source: "advance_state",
              uri: "file://context.json",
            },
          ],
        },
      });

      const advanceContent = Array.isArray(advanceResult.content) ? advanceResult.content[0] : undefined;
      assert.ok(advanceContent && advanceContent.type === "text");
      assert.ok(advanceContent.text.includes("Recorded completion"));

      const state = stateStore.getState();
      assert.equal(state.completedTools.length, 1);
      assert.equal(state.completedTools[0].id, "instruction-file");
      assert.equal(state.artifacts.release_notes_context.uri, "file://context.json");

      const exportResult = await client.callTool({
        name: "export_task_list",
        arguments: {},
      });
      const exportStructured = exportResult.structuredResult as Record<string, unknown>;
      assert.ok(exportStructured && exportStructured.ok === true, "expected ok result from export_task_list");
      const tasks = Array.isArray(exportStructured.tasks) ? exportStructured.tasks : [];
      assert.ok(tasks.length > 0, "expected tasks from export_task_list");
      const task = tasks.find((item) => (item as { id?: string }).id === "instruction-file");
      assert.ok(task, "expected instruction-file task in export");

      const refreshResult = await client.callTool({
        name: "refresh_metadata",
        arguments: {},
      });
      const refreshContent = Array.isArray(refreshResult.content) ? refreshResult.content[0] : undefined;
      assert.ok(refreshContent && refreshContent.type === "text");
      assert.ok(refreshContent.text.includes("Metadata validated"));
    } finally {
      await client.close();
      await server.close();
      await clientTransport.close();
      await serverTransport.close();
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
