import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { describe, test } from "@jest/globals";

import { loadPromptMetadata, preparePromptResources } from "./loader.ts";

const FIXTURE_MARKDOWN = `# Sample Prompt\n\nContent body.\n`;

const createFixture = () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "prompt-meta-"));
  const markdownPath = path.join(tempDir, "sample.md");
  writeFileSync(markdownPath, FIXTURE_MARKDOWN, "utf8");

  const metadataPath = path.join(tempDir, "prompts.meta.yaml");
  writeFileSync(
    metadataPath,
    `- id: sample\n  title: Sample Prompt\n  description: Example description\n  path: sample.md\n  phase: P0\n  gate: Test Gate\n  tags:\n    - alpha\n    - beta\n  dependsOn: []\n  variables:\n    - name: input\n      description: Optional input\n      type: string\n      required: false\n`,
    "utf8",
  );

  return { tempDir, metadataPath };
};

describe("prompt loader", () => {
  test("loads metadata and prepares prompt resources", () => {
    const { tempDir, metadataPath } = createFixture();
    try {
      const metadata = loadPromptMetadata({ metadataPath, baseDir: tempDir });
      assert.equal(metadata.length, 1);
      const definition = metadata[0];
      assert.equal(definition.id, "sample");
      assert.equal(definition.title, "Sample Prompt");
      assert.equal(definition.description, "Example description");
      assert.equal(definition.path, "sample.md");
      assert.deepEqual(definition.tags, ["alpha", "beta"]);
      assert.deepEqual(definition.dependsOn, []);
      assert.deepEqual(definition.variables, [
        {
          name: "input",
          description: "Optional input",
          type: "string",
          required: false,
        },
      ]);

      const resources = preparePromptResources(metadata, {
        baseDir: tempDir,
        previewLimit: 10,
      });
      assert.equal(resources.length, 1);
      const resource = resources[0];
      assert.match(resource.uri, /^file:\/\//);
      assert.equal(resource.metadata.name, "sample");
      assert.equal(resource.metadata.title, "Sample Prompt");
      assert.equal(resource.metadata.mimeType, "text/markdown");
      const meta = resource.metadata._meta as Record<string, unknown>;
      assert.ok(meta);
      assert.equal(typeof meta.contentPreview, "string");
      assert.ok((meta.contentPreview as string).length > 0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
