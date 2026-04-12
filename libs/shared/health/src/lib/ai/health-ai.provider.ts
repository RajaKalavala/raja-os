export interface HealthAiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HealthAiOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export type HealthAiModelName = 'gpt-4o' | 'claude-sonnet' | 'gemini-pro';

export interface HealthAiProvider {
  readonly name: HealthAiModelName;
  readonly displayName: string;
  isConfigured(): boolean;
  chat(messages: HealthAiMessage[], options?: HealthAiOptions): Promise<string>;
}
