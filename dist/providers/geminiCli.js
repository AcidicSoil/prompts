import { spawnSync } from 'node:child_process';
import { DependencyMissingError } from './interface.js';
export class GeminiCliProvider {
    name = 'gemini-cli';
    async ping() {
        const cmd = process.env.GEMINI_CLI ?? 'gemini';
        const res = spawnSync(cmd, ['--help'], { stdio: 'ignore' });
        return res.status === 0; // treat non-zero as unavailable
    }
    async generate(_prompt) {
        throw new DependencyMissingError('Gemini CLI generate not implemented for this repo.');
    }
}
