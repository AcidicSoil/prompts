export class ProviderError extends Error {}
export class ProviderUnavailableError extends ProviderError {}
export class DependencyMissingError extends ProviderError {}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
}

export interface LLMProvider {
  name: string;
  ping(): Promise<boolean>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

