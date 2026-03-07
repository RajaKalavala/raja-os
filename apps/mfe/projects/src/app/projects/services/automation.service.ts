import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { AutomationPost, PostPlatform, PostStatus } from '../models/automation.model';

/* eslint-disable @typescript-eslint/no-explicit-any */

const LINKEDIN_POST_PROMPT = `You are a personal branding expert helping a software engineer build their presence in the developer community. Generate an engaging LinkedIn post about the latest developments in AI, specifically related to Claude Code by Anthropic.

The post MUST:
- Be 150-250 words
- Start with a hook that grabs attention (a bold statement, surprising insight, or relatable scenario)
- Share a specific insight, tip, or opinion — not just generic hype
- End with a question or call-to-action to drive engagement
- Use emojis sparingly (2-4 max)
- Include 3-5 relevant hashtags at the end
- Sound authentic and personal — like a developer sharing real experience, NOT corporate marketing
- Position the author as someone who actively uses and experiments with AI tools
- Focus on practical value: what developers can learn, do, or try

Topics to rotate between (pick one):
- Claude Code CLI productivity tips and workflows
- AI-assisted coding best practices
- How AI is changing the developer experience
- Comparisons or complementary use of different AI tools
- Real-world use cases where AI saved time or improved code quality
- The future of software engineering with AI pair programming

Respond with ONLY the post text, no JSON, no markdown formatting.`;

@Injectable({ providedIn: 'root' })
export class AutomationService {
  private readonly supabase = inject(SupabaseService);
  private readonly apiKeyStorageKey = 'raja-os-openai-key';

  readonly posts = signal<AutomationPost[]>([]);
  readonly isGenerating = signal(false);

  constructor() {
    effect(() => {
      const user = this.supabase.currentUser();
      if (user) {
        this.loadPosts();
      } else {
        this.posts.set([]);
      }
    });
  }

  hasApiKey(): boolean {
    return !!localStorage.getItem(this.apiKeyStorageKey);
  }

  // ─── AI Generation ────────────────────────────────────────

  async generateLinkedInPost(): Promise<string> {
    const apiKey = localStorage.getItem(this.apiKeyStorageKey);
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Set it in Planner > Brainstorm > Settings.');
    }

    this.isGenerating.set(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: LINKEDIN_POST_PROMPT },
            { role: 'user', content: 'Generate a fresh LinkedIn post for today.' },
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid API key.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Try again shortly.');
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI.');

      return content.trim();
    } finally {
      this.isGenerating.set(false);
    }
  }

  // ─── Database Operations ──────────────────────────────────

  private toPost(row: any): AutomationPost {
    return {
      id: row.id,
      platform: row.platform,
      content: row.content,
      topic: row.topic || '',
      status: row.status,
      postedAt: row.posted_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async loadPosts(): Promise<void> {
    const { data } = await this.supabase.client
      .from('automation_posts')
      .select('*')
      .order('created_at', { ascending: false });

    this.posts.set((data || []).map((r) => this.toPost(r)));
  }

  async savePost(content: string, platform: PostPlatform, topic?: string): Promise<AutomationPost> {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await this.supabase.client
      .from('automation_posts')
      .insert({
        user_id: userId,
        platform,
        content,
        topic: topic || 'AI / Claude Code',
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    const post = this.toPost(row);
    this.posts.update((list) => [post, ...list]);
    return post;
  }

  async updatePost(id: string, content: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('automation_posts')
      .update({ content })
      .eq('id', id);

    if (error) throw error;
    this.posts.update((list) =>
      list.map((p) =>
        p.id === id ? { ...p, content, updatedAt: new Date().toISOString() } : p
      )
    );
  }

  async markAsPosted(id: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase.client
      .from('automation_posts')
      .update({ status: 'posted' as PostStatus, posted_at: now })
      .eq('id', id);

    if (error) throw error;
    this.posts.update((list) =>
      list.map((p) =>
        p.id === id ? { ...p, status: 'posted' as PostStatus, postedAt: now, updatedAt: now } : p
      )
    );
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('automation_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.posts.update((list) => list.filter((p) => p.id !== id));
  }
}
