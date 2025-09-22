import { ProviderUnavailableError } from './interface.js';
export class OllamaProvider {
    name = 'ollama';
    async ping() {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 500);
        try {
            const res = await fetch('http://127.0.0.1:11434/api/tags', {
                method: 'GET',
                cache: 'no-store',
                signal: controller.signal,
            });
            return res.ok;
        }
        catch {
            return false;
        }
        finally {
            clearTimeout(t);
        }
    }
    async generate(_prompt) {
        throw new ProviderUnavailableError('Ollama generate not wired in this project.');
    }
}
