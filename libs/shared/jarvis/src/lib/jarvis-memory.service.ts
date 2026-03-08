import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { JarvisMemory } from './jarvis.models';

@Injectable({ providedIn: 'root' })
export class JarvisMemoryService {
  private supabase = inject(SupabaseService);

  private get client() {
    return this.supabase.client;
  }

  private get userId() {
    return this.supabase.currentUser()?.id;
  }

  // ─── Memories ────────────────────────────────────────────

  async getMemories(limit = 50): Promise<JarvisMemory[]> {
    if (!this.userId) return [];
    const { data } = await this.client
      .from('jarvis_memories')
      .select('*')
      .eq('user_id', this.userId)
      .order('relevance_score', { ascending: false })
      .limit(limit);
    return (data || []).map(this.toMemory);
  }

  async getMemoryCount(): Promise<number> {
    if (!this.userId) return 0;
    const { count } = await this.client
      .from('jarvis_memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId);
    return count || 0;
  }

  async addMemory(mem: {
    memoryType: JarvisMemory['memoryType'];
    category: JarvisMemory['category'];
    content: string;
    source: JarvisMemory['source'];
    tags?: string[];
  }): Promise<void> {
    if (!this.userId) return;
    await this.client.from('jarvis_memories').insert({
      user_id: this.userId,
      memory_type: mem.memoryType,
      category: mem.category,
      content: mem.content,
      source: mem.source,
      tags: mem.tags || [],
    });
  }

  async deleteMemory(id: string): Promise<void> {
    await this.client.from('jarvis_memories').delete().eq('id', id);
  }

  async buildContext(category?: string): Promise<string> {
    if (!this.userId) return '';
    let query = this.client
      .from('jarvis_memories')
      .select('*')
      .eq('user_id', this.userId)
      .order('relevance_score', { ascending: false })
      .limit(20);

    if (category) {
      query = query.eq('category', category);
    }

    const { data } = await query;
    if (!data || data.length === 0) return 'No memories stored yet.';

    return data
      .map((m: Record<string, unknown>) => `[${m['memory_type']}/${m['category']}] ${m['content']}`)
      .join('\n');
  }

  // ─── Focus Sessions ─────────────────────────────────────

  async getFocusSessionsThisWeek(): Promise<number> {
    if (!this.userId) return 0;
    const weekStart = this.getWeekStart();
    const { count } = await this.client
      .from('jarvis_focus_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .gte('started_at', weekStart.toISOString());
    return count || 0;
  }

  async getTodayFocusStats(): Promise<{ sessions: number; minutes: number }> {
    if (!this.userId) return { sessions: 0, minutes: 0 };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await this.client
      .from('jarvis_focus_sessions')
      .select('actual_duration_minutes')
      .eq('user_id', this.userId)
      .eq('status', 'completed')
      .gte('started_at', todayStart.toISOString());

    const sessions = data?.length || 0;
    const minutes = (data || []).reduce((sum: number, s: Record<string, unknown>) =>
      sum + ((s['actual_duration_minutes'] as number) || 0), 0);
    return { sessions, minutes };
  }

  // ─── Goals (read from planner) ──────────────────────────

  async getActiveGoals(): Promise<{ id: string; title: string }[]> {
    if (!this.userId) return [];
    const { data } = await this.client
      .from('planner_goals')
      .select('id, title')
      .eq('user_id', this.userId)
      .eq('status', 'active');
    return (data || []) as { id: string; title: string }[];
  }

  // ─── Helpers ─────────────────────────────────────────────

  private toMemory(row: Record<string, unknown>): JarvisMemory {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      memoryType: row['memory_type'] as JarvisMemory['memoryType'],
      category: row['category'] as JarvisMemory['category'],
      content: row['content'] as string,
      source: row['source'] as JarvisMemory['source'],
      relevanceScore: (row['relevance_score'] as number) || 1.0,
      tags: (row['tags'] as string[]) || [],
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
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
}
