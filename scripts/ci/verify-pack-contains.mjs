#!/usr/bin/env node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function fail(msg) {
  console.error(`pack-verify: ${msg}`);
  process.exit(1);
}

const cacheDir = mkdtempSync(join(tmpdir(), 'npm-cache-'));
try {
  const result = spawnSync('npm', ['pack', '--json', '--dry-run'], {
    env: { ...process.env, npm_config_cache: cacheDir },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    console.error(result.stderr || '');
    fail(`npm pack failed with code ${result.status}`);
  }

  let json;
  try {
    json = JSON.parse(result.stdout);
  } catch (e) {
    console.error(result.stdout);
    fail('unable to parse npm pack --json output');
  }

  const entry = Array.isArray(json) ? json[0] : json;
  const files = entry && Array.isArray(entry.files) ? entry.files : [];
  if (!files.length) {
    fail('no files reported by npm pack');
  }

  const hasSchemas = files.some((f) => typeof f.path === 'string' && f.path.startsWith('schemas/'));
  const hasServer = files.some((f) => typeof f.path === 'string' && f.path === 'dist/mcp/server.js');

  if (!hasSchemas) {
    fail('schemas/ directory is missing from package contents');
  }
  if (!hasServer) {
    fail('dist/mcp/server.js is missing from package contents');
  }

  console.log('pack-verify: OK — schemas/ and dist/mcp/server.js present');
} finally {
  try { rmSync(cacheDir, { recursive: true, force: true }); } catch {}
}

