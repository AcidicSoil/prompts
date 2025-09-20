import { strict as assert } from 'node:assert';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PromptCatalog } from '../catalog_types.js';
import { regenerateWorkflow, synchronizeWorkflowDoc } from '../generate_docs.js';

async function main(): Promise<void> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-sync-'));
  const repoRoot = path.join(tmpRoot, 'repo');
  await fs.mkdir(repoRoot, { recursive: true });

  const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
  const workflowGraphPath = path.join(repoRoot, 'workflow.mmd');

  const initialWorkflow = `# Workflow\n\n## 5) Phases\n\n${'<!-- BEGIN GENERATED PHASES -->'}\n### P0 Preflight Docs (Blocking)\n\n- **Purpose**: Placeholder.\n${'<!-- commands:start -->'}\n- _No catalog commands mapped to this phase._\n${'<!-- commands:end -->'}\n${'<!-- END GENERATED PHASES -->'}\n`;
  await fs.writeFile(workflowPath, initialWorkflow, 'utf8');
  await fs.writeFile(workflowGraphPath, 'flowchart TD\n', 'utf8');

  const catalogBefore: PromptCatalog = {
    'p0-preflight-docs-blocking': [
      {
        phase: 'P0 Preflight Docs (Blocking)',
        command: '/alpha',
        title: 'Alpha',
        purpose: 'Initial command.',
        gate: 'Gate',
        status: 'Stable',
        previous: [],
        next: [],
        path: 'prompts/alpha.md',
      },
    ],
  };

  await synchronizeWorkflowDoc(repoRoot, catalogBefore);
  await regenerateWorkflow(repoRoot, catalogBefore);

  let workflow = await fs.readFile(workflowPath, 'utf8');
  assert.ok(workflow.includes('`/alpha`'), 'expected initial command in workflow doc');
  let mermaid = await fs.readFile(workflowGraphPath, 'utf8');
  assert.ok(mermaid.includes('/alpha/'), 'expected initial command in workflow graph');

  const catalogAfter: PromptCatalog = {
    'p0-preflight-docs-blocking': [
      {
        phase: 'P0 Preflight Docs (Blocking)',
        command: '/beta',
        title: 'Beta',
        purpose: 'Renamed command.',
        gate: 'Gate',
        status: 'Stable',
        previous: [],
        next: [],
        path: 'prompts/alpha.md',
      },
    ],
  };

  await synchronizeWorkflowDoc(repoRoot, catalogAfter);
  await regenerateWorkflow(repoRoot, catalogAfter);

  workflow = await fs.readFile(workflowPath, 'utf8');
  assert.ok(workflow.includes('`/beta`'), 'expected renamed command in workflow doc');
  assert.ok(!workflow.includes('`/alpha`'), 'expected original command removed from workflow doc');

  mermaid = await fs.readFile(workflowGraphPath, 'utf8');
  assert.ok(mermaid.includes('/beta/'), 'expected renamed command in workflow graph');
  assert.ok(!mermaid.includes('/alpha/'), 'expected original command removed from workflow graph');

  console.log('workflow sync regression test passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
