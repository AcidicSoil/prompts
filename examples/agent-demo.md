# Agent Demo — Daily Flow with MCP Tools

This example shows how a lightweight agent (or script) can wire `@prompts/tools` and the MCP server/CLI logic into a daily loop.

## Why

- Always know what to do next (dependency-aware).
- Close the loop quickly with status updates.
- Keep dashboards and teammates in sync via shared logic.

## Minimal agent pseudo-code

```ts
import { createPromptsTools, NextTaskInput, SetTaskStatusInput } from '@prompts/tools';
import { TaskService } from '../src/mcp/task-service.ts';

const service = new TaskService({ tasksPath: '.taskmaster/tasks/tasks.json', tag: 'master', writeEnabled: true });
await service.load();

const tools = createPromptsTools({
  service: {
    list: () => service.list(),
    next: () => service.next(),
    graph: () => service.graph(),
    setStatus: (id, status) => service.setStatus(id, status),
  },
});

// 1) Plan next step
const { task } = await tools.nextTask.run(NextTaskInput.parse({}));
if (!task) process.exit(0);

// 2) Execute your change (omitted)

// 3) Record completion
await tools.setTaskStatus.run(SetTaskStatusInput.parse({ id: task.id, status: 'done' }));

// 4) Re-plan (loop)
```

## MCP client tips

- Start server read-only for exploration: `node dist/mcp/server.js --write=false`.
- Switch to `--write=true` when you’re ready to persist `set_task_status` or `workflow/advance_state` changes.
- Use `graph_export` and `workflow/export_task_list` to power dashboards or PR annotations.
