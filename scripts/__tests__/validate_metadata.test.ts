import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function main(): Promise<void> {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(moduleDir, '..', '..');
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'metadata-validator-'));
  const repoRoot = path.join(tmpRoot, 'repo');
  await fs.mkdir(repoRoot, { recursive: true });
  await fs.mkdir(path.join(repoRoot, 'prompts'), { recursive: true });

  const workflowContent = `---\ntitle: Workflow\n---\n# Workflow\n\n## P0 Preflight Docs\n`;
  await fs.writeFile(path.join(repoRoot, 'WORKFLOW.md'), workflowContent, 'utf8');

  const promptPath = path.join(repoRoot, 'prompts', 'example.md');
  await fs.writeFile(promptPath, '# Example Prompt\n', 'utf8');

  const scriptPath = path.join(projectRoot, 'scripts', 'validate_metadata.ts');
  const child = spawn(
    process.execPath,
    ['--loader', 'ts-node/esm', scriptPath],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        PROMPTS_VALIDATION_ROOT: repoRoot,
      },
    },
  );

  const stderrChunks: string[] = [];
  const stdoutChunks: string[] = [];
  child.stderr?.setEncoding('utf8');
  child.stderr?.on('data', (chunk) => {
    stderrChunks.push(chunk);
  });
  child.stdout?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => {
    stdoutChunks.push(chunk);
  });

  const exitCode: number = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      resolve(code ?? 0);
    });
  });

  const stderrOutput = stderrChunks.join('');
  assert.strictEqual(exitCode, 1, 'expected validator to exit with failure');
  assert.ok(
    stderrOutput.includes('prompts/example.md: missing YAML front matter'),
    `expected missing front matter error, received: ${stderrOutput || stdoutChunks.join('')}`,
  );

  console.log('validate metadata missing front matter test passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
