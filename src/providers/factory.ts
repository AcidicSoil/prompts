import { LLMProvider } from './interface.js';
import { OllamaProvider } from './ollama.js';
import { GeminiCliProvider } from './geminiCli.js';
import { StubProvider } from './stub.js';

export const getProvider = async (): Promise<LLMProvider> => {
  const candidates: LLMProvider[] = [new OllamaProvider(), new GeminiCliProvider()];
  for (const p of candidates) {
    try {
      if (await p.ping()) return p;
    } catch {
      // ignore and continue
    }
  }
  return new StubProvider();
};
