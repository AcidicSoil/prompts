import { strict as assert } from 'node:assert';
import { describe, test } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { secureLogger } from '../../src/logger.ts';
import { createServer } from '../../src/server.ts';
import { registerAllTools } from '../../src/tools/index.ts';
import { TaskService } from '../../src/mcp/task-service.ts';
import { StateStore } from '../../src/state/StateStore.ts';

describe('server advertises unified toolset', () => {
  test('lists prompt, workflow, and task tools without duplicates', async () => {
    const server = createServer();

    const service = new TaskService({
      tasksPath: '.taskmaster/tasks/tasks.json',
      tag: 'master',
      writeEnabled: false,
    });
    await service.load();

    const stateStore = new StateStore(process.cwd());
    await stateStore.load();

    await registerAllTools(server, secureLogger, { service, stateStore });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    const client = new Client({ name: 'advertise-client', version: '1.0.0' });
    await client.connect(clientTransport);

    try {
      const tools = await client.listTools();
      const names = tools.tools.map((t) => t.name);

      // Expect at least a few known tools from each domain
      for (const expected of [
        'instruction-file', // prompt tool
        'refresh_metadata', // workflow tool
        'export_task_list', // workflow tool
        'next_task', // task tool
        'list_tasks', // task tool
        'workflow/run_task_action',
        'workflow/run_tests',
        'workflow/run_build',
        'workflow/run_lint',
      ]) {
        assert.ok(names.includes(expected), `expected tool ${expected}`);
      }

      // No duplicates
      const unique = new Set(names);
      assert.equal(unique.size, names.length, 'expected unique tool names');
    } finally {
      await client.close();
      await server.close();
      await clientTransport.close();
      await serverTransport.close();
    }
  });
});
