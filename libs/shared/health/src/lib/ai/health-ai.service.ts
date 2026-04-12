import { Injectable, signal } from '@angular/core';
import { HealthAiProvider, HealthAiMessage, HealthAiModelName } from './health-ai.provider';
import { OpenAiHealthProvider } from './openai.provider';
import { ClaudeHealthProvider } from './claude.provider';
import { GeminiHealthProvider } from './gemini.provider';
import { HEALTH_PROMPTS } from './health.prompts';
import { DocumentAnalysis } from '../models/health.models';

@Injectable({ providedIn: 'root' })
export class HealthAiService {
  private providers = new Map<HealthAiModelName, HealthAiProvider>([
    ['gpt-4o', new OpenAiHealthProvider()],
    ['claude-sonnet', new ClaudeHealthProvider()],
    ['gemini-pro', new GeminiHealthProvider()],
  ]);

  private readonly modelStorageKey = 'raja-os-health-ai-model';

  readonly activeModel = signal<HealthAiModelName>(this.loadModel());

  private loadModel(): HealthAiModelName {
    return (localStorage.getItem(this.modelStorageKey) as HealthAiModelName) ?? 'gpt-4o';
  }

  setModel(name: HealthAiModelName): void {
    this.activeModel.set(name);
    localStorage.setItem(this.modelStorageKey, name);
  }

  getProvider(): HealthAiProvider {
    return this.providers.get(this.activeModel())!;
  }

  getConfiguredProviders(): HealthAiProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isConfigured());
  }

  getAllProviders(): HealthAiProvider[] {
    return Array.from(this.providers.values());
  }

  async chat(userMessage: string, healthContext: string): Promise<string> {
    const provider = this.getProvider();
    const systemPrompt = HEALTH_PROMPTS.healthChat.replace('{health_context}', healthContext);

    const messages: HealthAiMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const response = await provider.chat(messages);

    // Strip memory extraction markers before returning to UI
    const cleanResponse = response.replace(/HEALTH_MEMORIES:.*$/ms, '').trim();
    return cleanResponse;
  }

  async analyzeDocument(fileBase64: string, fileType: string): Promise<DocumentAnalysis> {
    const provider = this.getProvider();
    const isImage = fileType.startsWith('image/');

    let userContent: string;
    if (isImage) {
      userContent = `Please analyze this medical document image and extract all structured data.\n\n[Image provided as base64 - analyze the content visible in the image]`;
    } else {
      userContent = `Please analyze this medical document and extract all structured data.\n\nDocument content (extracted text):\n${fileBase64.substring(0, 15000)}`;
    }

    const messages: HealthAiMessage[] = [
      { role: 'system', content: HEALTH_PROMPTS.documentAnalysis },
      { role: 'user', content: userContent },
    ];

    const response = await provider.chat(messages, { temperature: 0.3, jsonMode: true });

    try {
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        documentType: parsed.documentType || 'other',
        documentDate: parsed.documentDate || null,
        providerName: parsed.providerName || null,
        facilityName: parsed.facilityName || null,
        bodySystems: parsed.bodySystems || [],
        extractions: (parsed.extractions || []).map((e: any) => ({
          type: e.type || 'finding',
          label: e.label || '',
          value: String(e.value ?? ''),
          valueNumeric: e.valueNumeric ?? null,
          unit: e.unit || null,
          referenceRangeLow: e.referenceRangeLow ?? null,
          referenceRangeHigh: e.referenceRangeHigh ?? null,
          isFlagged: e.isFlagged ?? false,
          flagDirection: e.flagDirection || null,
          bodySystem: e.bodySystem || null,
          confidence: e.confidence ?? 0.8,
        })),
      };
    } catch (err) {
      console.error('Failed to parse AI document analysis:', err, response);
      return {
        summary: response.substring(0, 500),
        documentType: 'other',
        documentDate: null,
        providerName: null,
        facilityName: null,
        bodySystems: [],
        extractions: [],
      };
    }
  }

  async analyzeTrend(metricName: string, dataPoints: string): Promise<string> {
    const provider = this.getProvider();
    const prompt = HEALTH_PROMPTS.trendAnalysis
      .replace('{metric_name}', metricName)
      .replace('{data_points}', dataPoints);

    const messages: HealthAiMessage[] = [
      { role: 'user', content: prompt },
    ];

    return provider.chat(messages, { temperature: 0.5 });
  }
}
