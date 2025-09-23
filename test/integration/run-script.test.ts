import { describe, expect, test } from '@jest/globals';

import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';

describe('workflow_run_script tool', () => {
  test('rejects when execution is disabled', async () => {
    delete process.env.PROMPTS_EXEC_ALLOW;
    const tool = createRunScriptTool();
    const result = await tool.handler({ script: 'validate:metadata', dryRun: false, timeoutMs: 2000 });
    expect(result.isError).toBe(true);
  });

  test('runs in dry-run mode and lists command', async () => {
    const tool = createRunScriptTool();
    const result = await tool.handler({ script: 'validate:metadata', dryRun: true });
    expect(result.isError).toBe(false);
    expect(String(result.summary)).toContain('npm run --silent validate:metadata');
  });
});
