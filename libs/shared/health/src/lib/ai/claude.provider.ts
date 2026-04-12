import { HealthAiProvider, HealthAiMessage, HealthAiOptions, HealthAiModelName } from './health-ai.provider';

export class ClaudeHealthProvider implements HealthAiProvider {
  readonly name: HealthAiModelName = 'claude-sonnet';
  readonly displayName = 'Claude Sonnet';
  private readonly storageKey = 'raja-os-claude-key';

  isConfigured(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  async chat(messages: HealthAiMessage[], options?: HealthAiOptions): Promise<string> {
    const apiKey = localStorage.getItem(this.storageKey);
    if (!apiKey) throw new Error('Claude API key not configured. Set raja-os-claude-key in localStorage.');

    const system = messages.find(m => m.role === 'system')?.content ?? '';
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: options?.maxTokens ?? 2048,
        system,
        messages: conversationMessages,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Claude error ${response.status}: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? '';
  }
}
