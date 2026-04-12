import { HealthAiProvider, HealthAiMessage, HealthAiOptions, HealthAiModelName } from './health-ai.provider';

export class OpenAiHealthProvider implements HealthAiProvider {
  readonly name: HealthAiModelName = 'gpt-4o';
  readonly displayName = 'GPT-4o';
  private readonly storageKey = 'raja-os-openai-key';

  isConfigured(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  async chat(messages: HealthAiMessage[], options?: HealthAiOptions): Promise<string> {
    const apiKey = localStorage.getItem(this.storageKey);
    if (!apiKey) throw new Error('OpenAI API key not configured. Add it in Jarvis settings.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
        ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI error ${response.status}: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
  }
}
