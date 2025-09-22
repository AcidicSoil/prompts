# @prompts/tools

Lightweight adapters that expose Prompts task helpers as tool-style handlers usable with agent SDKs (e.g., Vercel AI SDK, Mastra).

## Install

This package is currently part of the monorepo; build it with:

```
npx tsc -p packages/prompts-tools/tsconfig.json
```

## Usage

```ts
import { createPromptsTools, SetTaskStatusInput } from '@prompts/tools';

// Provide a minimal Task API implementation
const tools = createPromptsTools({
  service: {
    list: () => taskService.list(),
    next: () => taskService.next(),
    graph: () => taskService.graph(),
    setStatus: (id, status) => taskService.setStatus(id, status),
  },
});

// Validate input with zod and run
const { name, input, run } = tools.setTaskStatus;
const args = SetTaskStatusInput.parse({ id: 1, status: 'done' });
const result = await run(args);
```

Tools exported:

- `nextTask` — returns `{ task, ready }`
- `setTaskStatus` — returns `{ task, persisted }`
- `graphExport` — returns `{ nodes }`

Schemas exported:

- `NextTaskInput`, `SetTaskStatusInput`, `GraphExportInput`, and `StatusEnum`.
