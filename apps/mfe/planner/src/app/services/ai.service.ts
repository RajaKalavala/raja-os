import { Injectable, signal } from '@angular/core';
import { AiPlanResponse } from '../models/planner.models';

export type AiProvider = 'openai' | 'claude';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an AI planning assistant for RajaOS — a personal planning and productivity tool.

The user will describe something they want to plan, achieve, or organize. Your job is to help them create a structured, actionable plan.

Analyze the user's input and respond with ONLY a valid JSON object (no markdown, no code fences):

**If the idea is vague or you need more clarity**, respond:
{
  "type": "questions",
  "message": "A friendly message explaining what you need to know",
  "questions": ["Specific question 1?", "Specific question 2?"]
}
Limit to 2-4 targeted, practical questions.

**If you have enough information**, create a structured plan:
{
  "type": "plan",
  "message": "A short summary of the plan you created",
  "goal": {
    "title": "Clear, concise goal title",
    "description": "What this goal achieves (1-2 sentences)",
    "category": "work|personal|health|finance|learning|side-projects|home",
    "priority": "critical|high|medium|low"
  },
  "tasks": [
    {
      "title": "Specific, actionable task title",
      "description": "Brief details about what to do",
      "priority": "critical|high|medium|low",
      "category": "work|personal|health|finance|learning|side-projects|home"
    }
  ]
}

Guidelines:
- Create 5-15 tasks per goal, ordered logically by dependency/priority
- Tasks should be clear enough to start working on immediately
- Pick the most fitting category from: work, personal, health, finance, learning, side-projects, home
- Set realistic priorities (don't make everything critical)
- Keep descriptions concise but informative
- Think about dependencies — order tasks so earlier ones enable later ones
- Tasks inherit the goal's category by default, but can override if appropriate
- ALWAYS respond with ONLY valid JSON — no markdown, no code blocks, no extra text`;

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly openaiKeyStorageKey = 'raja-os-openai-key';
  private readonly claudeKeyStorageKey = 'raja-os-claude-key';
  private readonly providerStorageKey = 'raja-os-ai-provider';
  private conversationHistory: ChatMessage[] = [];

  readonly activeProvider = signal<AiProvider>(this.loadProvider());

  private loadProvider(): AiProvider {
    const stored = localStorage.getItem(this.providerStorageKey);
    return stored === 'claude' ? 'claude' : 'openai';
  }

  setProvider(provider: AiProvider): void {
    this.activeProvider.set(provider);
    localStorage.setItem(this.providerStorageKey, provider);
    this.clearConversation();
  }

  // ─── Key Management ───────────────────────────────────────

  hasApiKey(provider?: AiProvider): boolean {
    const p = provider ?? this.activeProvider();
    const key = p === 'claude' ? this.claudeKeyStorageKey : this.openaiKeyStorageKey;
    return !!localStorage.getItem(key);
  }

  setApiKey(key: string, provider?: AiProvider): void {
    const p = provider ?? this.activeProvider();
    const storageKey = p === 'claude' ? this.claudeKeyStorageKey : this.openaiKeyStorageKey;
    localStorage.setItem(storageKey, key.trim());
  }

  removeApiKey(provider?: AiProvider): void {
    const p = provider ?? this.activeProvider();
    const storageKey = p === 'claude' ? this.claudeKeyStorageKey : this.openaiKeyStorageKey;
    localStorage.removeItem(storageKey);
  }

  hasOpenAiKey(): boolean {
    return !!localStorage.getItem(this.openaiKeyStorageKey);
  }

  hasClaudeKey(): boolean {
    return !!localStorage.getItem(this.claudeKeyStorageKey);
  }

  // ─── Conversation ─────────────────────────────────────────

  clearConversation(): void {
    this.conversationHistory = [];
  }

  // ─── Send Message ─────────────────────────────────────────

  async sendMessage(userMessage: string): Promise<AiPlanResponse> {
    const provider = this.activeProvider();

    if (provider === 'claude') {
      return this.sendClaude(userMessage);
    }
    return this.sendOpenAI(userMessage);
  }

  // ─── OpenAI ───────────────────────────────────────────────

  private async sendOpenAI(userMessage: string): Promise<AiPlanResponse> {
    const apiKey = localStorage.getItem(this.openaiKeyStorageKey);
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add your key in Settings.');
    }

    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: this.conversationHistory,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      this.conversationHistory.pop();
      if (response.status === 401) throw new Error('Invalid OpenAI API key.');
      if (response.status === 429) throw new Error('Rate limit exceeded. Try again shortly.');
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      this.conversationHistory.pop();
      throw new Error('Empty response from AI. Please try again.');
    }

    this.conversationHistory.push({ role: 'assistant', content });

    try {
      return JSON.parse(content) as AiPlanResponse;
    } catch {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  // ─── Claude (Anthropic) ───────────────────────────────────

  private async sendClaude(userMessage: string): Promise<AiPlanResponse> {
    const apiKey = localStorage.getItem(this.claudeKeyStorageKey);
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add your key in Settings.');
    }

    // Build messages for Claude (system goes separately)
    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Claude API: system is a top-level param, not in messages array
    const messages = this.conversationHistory
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

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
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      this.conversationHistory.pop();
      if (response.status === 401) throw new Error('Invalid Claude API key.');
      if (response.status === 429) throw new Error('Rate limit exceeded. Try again shortly.');
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      this.conversationHistory.pop();
      throw new Error('Empty response from Claude. Please try again.');
    }

    this.conversationHistory.push({ role: 'assistant', content });

    // Claude may wrap JSON in markdown code fences — strip them
    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      return JSON.parse(cleaned) as AiPlanResponse;
    } catch {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
