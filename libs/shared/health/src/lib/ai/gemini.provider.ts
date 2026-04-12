import { HealthAiProvider, HealthAiMessage, HealthAiOptions, HealthAiModelName } from './health-ai.provider';

export class GeminiHealthProvider implements HealthAiProvider {
  readonly name: HealthAiModelName = 'gemini-pro';
  readonly displayName = 'Gemini Flash';
  private readonly storageKey = 'raja-os-gemini-key';

  isConfigured(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  async chat(messages: HealthAiMessage[], options?: HealthAiOptions): Promise<string> {
    const apiKey = localStorage.getItem(this.storageKey);
    if (!apiKey) throw new Error('Gemini API key not configured. Set raja-os-gemini-key in localStorage.');

    const system = messages.find(m => m.role === 'system')?.content ?? '';
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Gemini error ${response.status}: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}
