import { describe, expect, test } from '@jest/globals';

import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';

describe('workflow/run_script error handling', () => {
  test('resolves on spawn error when npm is not found', async () => {
    // Enable execution path to reach spawn
    process.env.PROMPTS_EXEC_ALLOW = '1';

    const originalPath = process.env.PATH;
    try {
      process.env.PATH = '';
      const tool = createRunScriptTool();
      const result = await tool.handler({ script: 'validate:metadata', dryRun: false, timeoutMs: 2000 });
      expect(result.isError).toBe(true);
      expect(String(result.summary)).toMatch(/Failed to start process|ENOENT/);
    } finally {
      process.env.PATH = originalPath;
      delete process.env.PROMPTS_EXEC_ALLOW;
    }
  });
});

