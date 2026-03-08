import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { JarvisMemoryService } from './jarvis-memory.service';
import { JarvisDataService } from './jarvis-data.service';
import { JARVIS_PROMPTS } from './jarvis.prompts';
import {
  JarvisBriefing,
  JarvisChatMessage,
  JarvisCapture,
  FocusSession,
  LifeMetrics,
  WeeklyReview,
} from './jarvis.models';

@Injectable({ providedIn: 'root' })
export class JarvisService {
  private supabase = inject(SupabaseService);
  private memoryService = inject(JarvisMemoryService);
  private dataService = inject(JarvisDataService);

  private get client() {
    return this.supabase.client;
  }

  private get userId() {
    return this.supabase.currentUser()?.id;
  }

  private getApiKey(): string {
    return localStorage.getItem('raja-os-openai-key') || '';
  }

  // ─── AI Call ─────────────────────────────────────────────

  private async callAI(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('No API key configured. Set your OpenAI key in the Planner Brainstorm tab.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async buildPrompt(promptKey: keyof typeof JARVIS_PROMPTS): Promise<string> {
    const context = await this.memoryService.buildContext();
    const liveData = await this.dataService.getLiveDataSummary();
    return JARVIS_PROMPTS[promptKey]
      .replace('{context}', context)
      .replace('{live_data}', liveData);
  }

  private async extractAndStoreMemories(text: string): Promise<void> {
    const marker = 'JARVIS_MEMORIES:';
    const idx = text.indexOf(marker);
    if (idx === -1) return;

    try {
      const jsonStr = text.substring(idx + marker.length).trim();
      const memories = JSON.parse(jsonStr);
      if (!Array.isArray(memories)) return;

      for (const mem of memories) {
        if (mem.content && mem.type && mem.category) {
          await this.memoryService.addMemory({
            memoryType: mem.type,
            category: mem.category,
            content: mem.content,
            source: 'chat',
          });
        }
      }
    } catch {
      // Failed to parse memories — that's OK
    }
  }

  // ─── Morning Briefing ───────────────────────────────────

  async getTodaysBriefing(): Promise<JarvisBriefing | null> {
    if (!this.userId) return null;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('jarvis_briefings')
      .select('*')
      .eq('user_id', this.userId)
      .eq('briefing_date', today)
      .maybeSingle();
    if (!data) return null;
    return this.toBriefing(data);
  }

  async generateBriefing(): Promise<JarvisBriefing> {
    const systemPrompt = await this.buildPrompt('briefing');
    const raw = await this.callAI(systemPrompt, 'Generate my morning briefing for today.');

    let parsed: { topPriority?: string; aiInsight?: string };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { topPriority: raw.substring(0, 200), aiInsight: '' };
    }

    const today = new Date().toISOString().split('T')[0];
    const briefing: Record<string, unknown> = {
      user_id: this.userId,
      briefing_date: today,
      top_priority: parsed.topPriority || 'Check your planner',
      ai_insight: parsed.aiInsight || '',
      raw_data: {},
    };

    const { data } = await this.client
      .from('jarvis_briefings')
      .upsert(briefing, { onConflict: 'user_id,briefing_date' })
      .select()
      .single();

    return this.toBriefing(data || briefing);
  }

  // ─── Chat ───────────────────────────────────────────────

  async chat(userMessage: string): Promise<string> {
    if (!this.userId) throw new Error('Not logged in');

    // Save user message
    await this.client.from('jarvis_chat_sessions').insert({
      user_id: this.userId,
      role: 'user',
      content: userMessage,
    });

    const systemPrompt = await this.buildPrompt('chat');
    const rawResponse = await this.callAI(systemPrompt, userMessage);

    // Extract memories
    await this.extractAndStoreMemories(rawResponse);

    // Clean response (remove JARVIS_MEMORIES line)
    const cleanResponse = rawResponse.replace(/JARVIS_MEMORIES:.*$/m, '').trim();

    // Save assistant message
    await this.client.from('jarvis_chat_sessions').insert({
      user_id: this.userId,
      role: 'assistant',
      content: cleanResponse,
    });

    return cleanResponse;
  }

  async getChatHistory(limit = 50): Promise<JarvisChatMessage[]> {
    if (!this.userId) return [];
    const { data } = await this.client
      .from('jarvis_chat_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row['id'] as string,
      role: row['role'] as 'user' | 'assistant',
      content: row['content'] as string,
      metadata: row['metadata'] as Record<string, unknown> | undefined,
      createdAt: new Date(row['created_at'] as string),
    }));
  }

  async clearChatHistory(): Promise<void> {
    if (!this.userId) return;
    await this.client
      .from('jarvis_chat_sessions')
      .delete()
      .eq('user_id', this.userId);
  }

  // ─── Quick Capture ──────────────────────────────────────

  async captureThought(rawInput: string): Promise<JarvisCapture> {
    if (!this.userId) throw new Error('Not logged in');

    const prompt = JARVIS_PROMPTS.capture.replace('{input}', rawInput);
    const raw = await this.callAI(prompt, rawInput);

    let classified: {
      classifiedType?: string;
      classifiedCategory?: string;
      aiSummary?: string;
    };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      classified = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      classified = {};
    }

    const record = {
      user_id: this.userId,
      raw_input: rawInput,
      classified_type: classified.classifiedType || null,
      classified_category: classified.classifiedCategory || null,
      ai_summary: classified.aiSummary || null,
      status: 'pending',
    };

    const { data } = await this.client
      .from('jarvis_captures')
      .insert(record)
      .select()
      .single();

    return this.toCapture(data || record);
  }

  async getCaptures(limit = 20): Promise<JarvisCapture[]> {
    if (!this.userId) return [];
    const { data } = await this.client
      .from('jarvis_captures')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(this.toCapture);
  }

  async routeCapture(id: string): Promise<void> {
    await this.client
      .from('jarvis_captures')
      .update({ status: 'routed' })
      .eq('id', id);
  }

  async dismissCapture(id: string): Promise<void> {
    await this.client
      .from('jarvis_captures')
      .update({ status: 'dismissed' })
      .eq('id', id);
  }

  // ─── Focus Sessions ────────────────────────────────────

  async startFocusSession(session: FocusSession): Promise<void> {
    if (!this.userId) return;
    await this.client.from('jarvis_focus_sessions').insert({
      id: session.id,
      user_id: this.userId,
      task_description: session.taskDescription,
      goal_id: session.goalId,
      planned_duration_minutes: session.plannedDurationMinutes,
      status: 'active',
    });
  }

  async saveFocusSession(session: FocusSession): Promise<void> {
    await this.client
      .from('jarvis_focus_sessions')
      .update({
        status: session.status,
        actual_duration_minutes: session.actualDurationMinutes,
        completion_notes: session.completionNotes,
        blockers: session.blockers,
        focus_rating: session.focusRating,
        ended_at: session.endedAt?.toISOString(),
      })
      .eq('id', session.id);
  }

  // ─── Life Metrics ──────────────────────────────────────

  async calculateMetrics(): Promise<LifeMetrics> {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    // Calculate scores from live data
    const [workScore, healthScore, learningScore, sideProjectScore, financeScore, brandScore] =
      await Promise.all([
        this.calcWorkScore(),
        this.calcCategoryScore('health'),
        this.calcCategoryScore('learning'),
        this.calcSideProjectScore(),
        this.calcCategoryScore('finance'),
        this.calcBrandScore(),
      ]);

    const overall = Math.round(
      (workScore + healthScore + learningScore + sideProjectScore + financeScore + brandScore) / 6,
    );

    return {
      weekNumber,
      year,
      work: workScore,
      health: healthScore,
      learning: learningScore,
      sideProject: sideProjectScore,
      finance: financeScore,
      brand: brandScore,
      overall,
    };
  }

  async saveMetricsSnapshot(metrics: LifeMetrics): Promise<void> {
    if (!this.userId) return;
    const today = new Date().toISOString().split('T')[0];
    await this.client.from('jarvis_metrics_snapshots').upsert({
      user_id: this.userId,
      snapshot_date: today,
      week_number: metrics.weekNumber,
      year: metrics.year,
      work_score: metrics.work,
      health_score: metrics.health,
      learning_score: metrics.learning,
      side_project_score: metrics.sideProject,
      finance_score: metrics.finance,
      brand_score: metrics.brand,
      overall_score: metrics.overall,
    });
  }

  private async calcWorkScore(): Promise<number> {
    if (!this.userId) return 0;
    const weekStart = this.getWeekStart();
    const { data: tasks } = await this.client
      .from('planner_tasks')
      .select('status')
      .eq('user_id', this.userId)
      .eq('category', 'work')
      .gte('updated_at', weekStart.toISOString());
    if (!tasks || tasks.length === 0) return 50;
    const done = tasks.filter((t: Record<string, unknown>) => t['status'] === 'done').length;
    return Math.min(100, Math.round((done / tasks.length) * 100));
  }

  private async calcCategoryScore(category: string): Promise<number> {
    if (!this.userId) return 50;
    const { data: goals } = await this.client
      .from('planner_goals')
      .select('status')
      .eq('user_id', this.userId)
      .eq('category', category)
      .eq('status', 'active');
    if (!goals || goals.length === 0) return 50;
    return 50; // Base score — will improve with habit data
  }

  private async calcSideProjectScore(): Promise<number> {
    if (!this.userId) return 0;
    const weekStart = this.getWeekStart();
    const { data: tasks } = await this.client
      .from('planner_tasks')
      .select('status')
      .eq('user_id', this.userId)
      .eq('category', 'side-projects')
      .gte('updated_at', weekStart.toISOString());
    if (!tasks || tasks.length === 0) return 30;
    const done = tasks.filter((t: Record<string, unknown>) => t['status'] === 'done').length;
    return Math.min(100, Math.round((done / Math.max(tasks.length, 1)) * 80 + 20));
  }

  private async calcBrandScore(): Promise<number> {
    if (!this.userId) return 0;
    const { data: posts } = await this.client
      .from('automation_posts')
      .select('status, created_at')
      .eq('user_id', this.userId)
      .eq('status', 'posted')
      .order('created_at', { ascending: false })
      .limit(5);
    if (!posts || posts.length === 0) return 10;
    const weekStart = this.getWeekStart();
    const thisWeek = posts.filter((p: Record<string, unknown>) =>
      new Date(p['created_at'] as string) >= weekStart);
    let score = 0;
    if (thisWeek.length > 0) score += 50;
    if (thisWeek.length >= 3) score += 30;
    else score += thisWeek.length * 10;
    const lastPost = posts[0];
    const daysSince = Math.floor(
      (Date.now() - new Date(lastPost['created_at'] as string).getTime()) / 86400000,
    );
    if (daysSince < 3) score += 20;
    return Math.min(100, score);
  }

  // ─── Weekly Review ──────────────────────────────────────

  async generateWeeklyReview(): Promise<WeeklyReview> {
    const systemPrompt = await this.buildPrompt('weeklyReview');
    const raw = await this.callAI(systemPrompt, 'Generate my weekly review for the past 7 days.');

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { aiReflection: raw };
    }

    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0];
    const ws = this.getWeekStart();
    const weekStart = ws.toISOString().split('T')[0];

    return {
      id: crypto.randomUUID(),
      userId: this.userId || '',
      reviewDate: weekEnd,
      weekStart,
      weekEnd,
      shipped: (parsed['shipped'] as string) || '',
      wins: (parsed['wins'] as string) || '',
      missed: (parsed['missed'] as string) || '',
      challenges: (parsed['challenges'] as string) || '',
      habitSummary: {},
      goalProgress: {},
      aiReflection: (parsed['aiReflection'] as string) || '',
      linkedinDraft: (parsed['linkedinDraft'] as string) || '',
    };
  }

  async saveWeeklyReview(review: WeeklyReview): Promise<void> {
    if (!this.userId) return;
    await this.client.from('jarvis_weekly_reviews').insert({
      user_id: this.userId,
      review_date: review.reviewDate,
      week_start: review.weekStart,
      week_end: review.weekEnd,
      wins: review.wins,
      challenges: review.challenges,
      shipped: review.shipped,
      missed: review.missed,
      habit_summary: review.habitSummary,
      goal_progress: review.goalProgress,
      ai_reflection: review.aiReflection,
      linkedin_draft: review.linkedinDraft,
    });
  }

  async getLatestReview(): Promise<WeeklyReview | null> {
    if (!this.userId) return null;
    const { data } = await this.client
      .from('jarvis_weekly_reviews')
      .select('*')
      .eq('user_id', this.userId)
      .order('review_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data['id'],
      userId: data['user_id'],
      reviewDate: data['review_date'],
      weekStart: data['week_start'],
      weekEnd: data['week_end'],
      wins: data['wins'],
      challenges: data['challenges'],
      shipped: data['shipped'],
      missed: data['missed'],
      habitSummary: data['habit_summary'] || {},
      goalProgress: data['goal_progress'] || {},
      aiReflection: data['ai_reflection'],
      linkedinDraft: data['linkedin_draft'],
    };
  }

  // ─── Helpers ─────────────────────────────────────────────

  private toBriefing(row: Record<string, unknown>): JarvisBriefing {
    return {
      id: (row['id'] as string) || '',
      userId: (row['user_id'] as string) || '',
      briefingDate: row['briefing_date'] as string,
      topPriority: (row['top_priority'] as string) || '',
      aiInsight: (row['ai_insight'] as string) || '',
      rawData: (row['raw_data'] as JarvisBriefing['rawData']) || {} as JarvisBriefing['rawData'],
      generatedAt: new Date((row['generated_at'] as string) || Date.now()),
    };
  }

  private toCapture(row: Record<string, unknown>): JarvisCapture {
    return {
      id: (row['id'] as string) || crypto.randomUUID(),
      userId: (row['user_id'] as string) || '',
      rawInput: (row['raw_input'] as string) || '',
      classifiedType: row['classified_type'] as JarvisCapture['classifiedType'],
      classifiedCategory: row['classified_category'] as string | null,
      aiSummary: row['ai_summary'] as string | null,
      routedTo: row['routed_to'] as string | null,
      routedId: row['routed_id'] as string | null,
      status: (row['status'] as JarvisCapture['status']) || 'pending',
      createdAt: new Date((row['created_at'] as string) || Date.now()),
    };
  }

  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  }
}
