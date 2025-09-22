import { LLMProvider } from './interface.js';

export class StubProvider implements LLMProvider {
  name = 'stub';
  async ping(): Promise<boolean> { return true; }
  async generate(prompt: string): Promise<string> {
    return `STUB: ${prompt.slice(0, 32)}`;
  }
}
