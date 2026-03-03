import { Injectable } from '@angular/core';
import { AiPlanResponse } from '../models/planner.models';

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
  "mission": {
    "title": "Clear, concise mission title",
    "description": "What this mission achieves (1-2 sentences)",
    "category": "work|personal|health|finance|learning|side-projects|home",
    "priority": "critical|high|medium|low"
  },
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What this milestone achieves",
      "tasks": [
        {
          "title": "Specific, actionable task title",
          "description": "Brief details about what to do",
          "priority": "critical|high|medium|low",
          "category": "work|personal|health|finance|learning|side-projects|home"
        }
      ]
    }
  ]
}

Guidelines:
- Create 2-5 milestones per mission, ordered logically
- Each milestone should have 2-6 specific, actionable tasks
- Tasks should be clear enough to start working on immediately
- Pick the most fitting category from: work, personal, health, finance, learning, side-projects, home
- Set realistic priorities (don't make everything critical)
- Keep descriptions concise but informative
- Think about dependencies — order milestones so earlier ones enable later ones
- Tasks inherit the mission's category by default, but can override if appropriate
- ALWAYS respond with ONLY valid JSON — no markdown, no code blocks, no extra text`;

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly apiKeyStorageKey = 'raja-os-openai-key';
  private conversationHistory: ChatMessage[] = [];

  hasApiKey(): boolean {
    return !!localStorage.getItem(this.apiKeyStorageKey);
  }

  setApiKey(key: string): void {
    localStorage.setItem(this.apiKeyStorageKey, key.trim());
  }

  removeApiKey(): void {
    localStorage.removeItem(this.apiKeyStorageKey);
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }

  async sendMessage(userMessage: string): Promise<AiPlanResponse> {
    const apiKey = localStorage.getItem(this.apiKeyStorageKey);
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add your key in Settings.');
    }

    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({
        role: 'system',
        content: SYSTEM_PROMPT,
      });
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
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
      }
    );

    if (!response.ok) {
      // Remove the failed user message from history
      this.conversationHistory.pop();

      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your OpenAI API key in Settings.'
        );
      }
      if (response.status === 429) {
        throw new Error(
          'Rate limit exceeded. Please wait a moment and try again.'
        );
      }
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.error?.message || `API error (${response.status})`
      );
    }

    const data = await response.json();
    const assistantContent = data.choices[0]?.message?.content;

    if (!assistantContent) {
      this.conversationHistory.pop();
      throw new Error('Empty response from AI. Please try again.');
    }

    this.conversationHistory.push({
      role: 'assistant',
      content: assistantContent,
    });

    try {
      return JSON.parse(assistantContent) as AiPlanResponse;
    } catch {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
