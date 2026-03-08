import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { JarvisMemory, JarvisHabit } from './jarvis.models';

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

  // ─── Habits ─────────────────────────────────────────────

  async getHabits(): Promise<JarvisHabit[]> {
    if (!this.userId) return [];
    const { data } = await this.client
      .from('jarvis_habits')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    return (data || []).map(this.toHabit);
  }

  async addHabit(habit: {
    name: string;
    category: 'health' | 'learning' | 'work' | 'personal';
    frequency: 'daily' | 'weekdays' | 'weekly';
    color: string;
    icon: string;
  }): Promise<void> {
    if (!this.userId) return;
    await this.client.from('jarvis_habits').insert({
      user_id: this.userId,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      target_count: 1,
      color: habit.color,
      icon: habit.icon,
      is_active: true,
    });
  }

  async updateHabit(id: string, updates: {
    name?: string;
    category?: 'health' | 'learning' | 'work' | 'personal';
    frequency?: 'daily' | 'weekdays' | 'weekly';
    color?: string;
    icon?: string;
  }): Promise<void> {
    const row: Record<string, unknown> = {};
    if (updates.name !== undefined) row['name'] = updates.name;
    if (updates.category !== undefined) row['category'] = updates.category;
    if (updates.frequency !== undefined) row['frequency'] = updates.frequency;
    if (updates.color !== undefined) row['color'] = updates.color;
    if (updates.icon !== undefined) row['icon'] = updates.icon;
    await this.client.from('jarvis_habits').update(row).eq('id', id);
  }

  async deleteHabit(id: string): Promise<void> {
    await this.client.from('jarvis_habits').delete().eq('id', id);
  }

  async getTodayLogs(): Promise<Map<string, boolean>> {
    if (!this.userId) return new Map();
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('jarvis_habit_logs')
      .select('habit_id, completed')
      .eq('user_id', this.userId)
      .eq('logged_date', today);
    const map = new Map<string, boolean>();
    for (const row of data || []) {
      map.set(row['habit_id'] as string, row['completed'] as boolean);
    }
    return map;
  }

  async toggleHabitLog(habitId: string): Promise<boolean> {
    if (!this.userId) return false;
    const today = new Date().toISOString().split('T')[0];

    // Check if log exists for today
    const { data: existing } = await this.client
      .from('jarvis_habit_logs')
      .select('id, completed')
      .eq('user_id', this.userId)
      .eq('habit_id', habitId)
      .eq('logged_date', today)
      .maybeSingle();

    if (existing) {
      const newState = !(existing['completed'] as boolean);
      await this.client
        .from('jarvis_habit_logs')
        .update({ completed: newState })
        .eq('id', existing['id']);
      return newState;
    } else {
      await this.client.from('jarvis_habit_logs').insert({
        user_id: this.userId,
        habit_id: habitId,
        logged_date: today,
        completed: true,
      });
      return true;
    }
  }

  async getHabitStreak(habitId: string): Promise<number> {
    if (!this.userId) return 0;
    const { data } = await this.client
      .from('jarvis_habit_logs')
      .select('logged_date, completed')
      .eq('user_id', this.userId)
      .eq('habit_id', habitId)
      .eq('completed', true)
      .order('logged_date', { ascending: false })
      .limit(365);

    if (!data || data.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const logDate = new Date(data[i]['logged_date'] as string);
      logDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ─── Helpers ─────────────────────────────────────────────

  private toHabit(row: Record<string, unknown>): JarvisHabit {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      name: row['name'] as string,
      category: row['category'] as JarvisHabit['category'],
      frequency: row['frequency'] as JarvisHabit['frequency'],
      targetCount: (row['target_count'] as number) || 1,
      color: (row['color'] as string) || '#10b981',
      icon: (row['icon'] as string) || '',
      isActive: (row['is_active'] as boolean) ?? true,
    };
  }

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
