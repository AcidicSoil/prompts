import { describe, expect, test } from '@jest/globals';

import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';

describe('workflow_run_script live execution (gated)', () => {
  test('executes allowlisted noop when PROMPTS_EXEC_ALLOW=1', async () => {
    const prev = process.env.PROMPTS_EXEC_ALLOW;
    process.env.PROMPTS_EXEC_ALLOW = '1';
    try {
      const tool = createRunScriptTool();
      const result: any = await tool.handler({ script: 'noop', dryRun: false, timeoutMs: 2000 });
      expect(result.isError).toBe(false);
      expect(result.ok).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(String(result.summary)).toMatch(/Exited with code 0/);
    } finally {
      if (prev === undefined) delete process.env.PROMPTS_EXEC_ALLOW; else process.env.PROMPTS_EXEC_ALLOW = prev;
    }
  });
});
