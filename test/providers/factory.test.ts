import { describe, expect, test, afterEach, jest } from '@jest/globals';

import { getProvider } from '../../src/providers/factory.ts';

const realFetch = global.fetch;

describe('provider factory', () => {
  afterEach(() => {
    global.fetch = realFetch as any;
    // cannot easily restore spawnSync; tests avoid modifying it directly
  });

  test('selects Ollama when health endpoint is OK', async () => {
    global.fetch = (async () => ({ ok: true })) as any;
    const p = await getProvider();
    expect(p.name).toBe('ollama');
  });

  test('falls back to gemini when Ollama unavailable', async () => {
    global.fetch = (async () => { throw new Error('offline'); }) as any;
    const originalCli = process.env.GEMINI_CLI;
    try {
      // Use a ubiquitous success command to simulate CLI presence
      process.env.GEMINI_CLI = 'true';
      const p = await getProvider();
      expect(p.name).toBe('gemini-cli');
    } finally {
      if (originalCli === undefined) delete process.env.GEMINI_CLI; else process.env.GEMINI_CLI = originalCli;
    }
  });

  test('uses stub when none available', async () => {
    global.fetch = (async () => { throw new Error('offline'); }) as any;
    const originalPath = process.env.PATH;
    const originalCli = process.env.GEMINI_CLI;
    try {
      process.env.PATH = '';
      process.env.GEMINI_CLI = '/definitely_not_found_cmd_xyz';
      const p = await getProvider();
      expect(p.name).toBe('stub');
    } finally {
      process.env.PATH = originalPath;
      if (originalCli === undefined) delete process.env.GEMINI_CLI; else process.env.GEMINI_CLI = originalCli;
    }
  });
});
