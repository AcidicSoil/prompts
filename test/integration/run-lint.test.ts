import { describe, expect, test } from '@jest/globals';
import { createRunLintTool } from '../../src/tools/definitions/run-domain.ts';

describe('workflow_run_lint', () => {
  test('dry-run returns the expected command summary', async () => {
    const tool = createRunLintTool();
    const res: any = await tool.handler({ dryRun: true });
    expect(res.isError).toBe(false);
    expect(String(res.summary)).toMatch(/npm run --silent lint/);
  });

  test('live run is gated by PROMPTS_EXEC_ALLOW and returns disabled error', async () => {
    const tool = createRunLintTool();
    const res: any = await tool.handler({ dryRun: false });
    expect(res.isError).toBe(true);
    expect(String(res.summary)).toMatch(/Execution disabled/);
  });
});
