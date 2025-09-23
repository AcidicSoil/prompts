Timeline of advance_state MCP tool changes
2025-09-20 – Initial tool introduction
• Commit 87aa29a (“feat(workflow): implement workflow planner and state management”) created the advance_state definition with a Zod schema whose outputs field is a z.record(z.any()) and whose handler persists completions via StateStore.
• The same commit wired the tool into registerWorkflowTools, passing advanceState.inputSchema.shape straight through to the MCP server when registering the tool.

2025-09-20 – CLI alignment & docs
• Commit 9f6ca4d added CLI support and documentation that refers to the workflow namespace (e.g., workflow/advance_state), even though the registered tool name remained advance_state. The current docs still advertise that namespace in the tool tables and examples.

2025-09-22 – Unified registration hub
• Commit d89efc2 reorganized startup via registerAllTools, so advance_state now ships alongside prompt tools and task tools whenever the server boots.

2025-09-22 – Execution loop & slash-prefixed names
• Commit 62012e8 introduced runner utilities (initially named with `workflow/` prefixes such as workflow/run_script, workflow/run_tests, workflow/run_build, and workflow/run_task_action) whose name fields include a / separator and are registered verbatim as MCP tools.

2025-09-22 – Additional runner
• Commit 585ca7b added workflow/run_lint, continuing the slash-based naming convention in both the definition and registration loops until the recent rename to underscore variants.

Error analysis
(a) invalid type: map, expected a boolean
OpenAI adapters expect JSON Schema when translating MCP tools. The advance_state tool still exposes a Zod shape (advanceState.inputSchema.shape) rather than a JSON Schema object, and that shape contains Zod instances such as z.record(z.any()).default({}). When the adapter deserializes this structure, it encounters nested maps where it expects primitive JSON Schema flags (e.g., additionalProperties: boolean), triggering the reported invalid type: map failure. This behavior originates in the initial implementation and persists today.

(b) Invalid 'tools[115].name' … matches ^[a-zA-Z0-9_-]+$
Beginning with the execution-loop work, several workflow tools were registered with names that embed a forward slash (e.g., workflow/run_script, workflow/run_tests, workflow/run_build, workflow/run_task_action, and later workflow/run_lint). MCP itself accepts these, but OpenAI’s tool-name validator only allows alphanumerics,_, and -, so any attempt to sync the server’s tool list to OpenAI fails when those slash-bearing names are encountered (tool index ≈115 in the aggregated list). Renaming the tools to underscore variants removes this blocker for OpenAI integrations.

Notes & follow-up signals
Documentation and user-facing guides already market the workflow namespace (workflow/advance_state, etc.), so renaming tools to comply with OpenAI may require coordinated doc updates.
