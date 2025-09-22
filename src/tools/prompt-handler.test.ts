import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { describe, test } from "@jest/globals";

import { createPromptToolHandler } from "./prompt-handler.ts";
import { PromptDefinition } from "../prompts/loader.ts";

const definition: PromptDefinition = {
  id: "sample",
  title: "Sample Prompt",
  description: "Test prompt",
  path: "prompt.md",
  dependsOn: [],
  tags: [],
};

describe("createPromptToolHandler", () => {
  test("renders prompt content with footer and respects payload limit", async () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "prompt-handler-"));
    const promptPath = path.join(tempDir, "prompt.md");
    writeFileSync(promptPath, "Line 1\nLine 2\n", "utf8");

    try {
      const handler = createPromptToolHandler(definition, tempDir, {
        payloadLimit: 64,
        footerTemplate: "\n-- {id} --",
      });

      const result = await handler({} as any);
      assert.equal(result.isError, undefined);
      const [content] = result.content ?? [];
      assert.ok(content && content.type === "text");
      const text = content.text;
      assert.ok(text.includes("Line 1"));
      assert.ok(text.includes("-- sample --"));
      assert.ok(Buffer.byteLength(text, "utf8") <= 64);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
