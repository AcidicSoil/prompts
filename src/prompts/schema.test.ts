import { strict as assert } from "node:assert";

import { z } from "zod";

import { generateToolSchemas } from "./schema.ts";
import { PromptDefinition } from "./loader.ts";

const definition: PromptDefinition = {
  id: "release-notes",
  title: "Release Notes",
  description: "Summarize commits",
  path: "release-notes.md",
  variables: [
    { name: "range", type: "string", description: "Git range", required: false },
    { name: "limit", type: "number", description: "Max entries", required: true },
    { name: "includeDocs", type: "boolean", description: "Include docs", required: false },
  ],
};

const runTests = () => {
  const schemas = generateToolSchemas(definition);
  assert.ok(schemas.output.content);
  assert.equal(typeof schemas.output.content.parse("hello"), "string");
  assert.ok(schemas.input);
  const inputObject = schemas.input ?? {};
  const inputSchema = z.object(inputObject);
  const parsed = inputSchema.safeParse({ limit: 10 });
  assert.ok(parsed.success, `Expected schema to parse input: ${parsed.error?.toString()}`);
  assert.equal(parsed.data.limit, 10);
  assert.equal(parsed.data.range, undefined);
};

try {
  runTests();
  console.log("schema generator tests passed.");
} catch (error) {
  console.error("Schema generator tests failed:", error);
  process.exitCode = 1;
}
