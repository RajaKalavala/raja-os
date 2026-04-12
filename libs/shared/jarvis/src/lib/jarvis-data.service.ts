import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { HealthDataService } from '@org/health';

@Injectable({ providedIn: 'root' })
export class JarvisDataService {
  private supabase = inject(SupabaseService);
  private healthDataService = inject(HealthDataService);

  private get client() {
    return this.supabase.client;
  }

  private get userId() {
    return this.supabase.currentUser()?.id;
  }

  async getLiveDataSummary(): Promise<string> {
    if (!this.userId) return 'No user logged in.';

    const [goals, tasks, captures, posts, focusSessions, health] = await Promise.all([
      this.getGoalsSummary(),
      this.getTasksSummary(),
      this.getCapturesSummary(),
      this.getPostsSummary(),
      this.getFocusSummary(),
      this.getHealthSummary(),
    ]);

    return [
      `Active Goals: ${goals}`,
      `Tasks: ${tasks}`,
      `Pending Captures: ${captures}`,
      `Content Posts: ${posts}`,
      `Focus Sessions: ${focusSessions}`,
      `Health: ${health}`,
    ].join('\n');
  }

  private async getHealthSummary(): Promise<string> {
    try {
      return await this.healthDataService.getHealthSummary();
    } catch {
      return 'Health data unavailable';
    }
  }

  private async getGoalsSummary(): Promise<string> {
    const { data } = await this.client
      .from('planner_goals')
      .select('title, status, category, priority')
      .eq('user_id', this.userId!);
    if (!data || data.length === 0) return 'None';
    const active = data.filter((g: Record<string, unknown>) => g['status'] === 'active');
    return `${active.length} active of ${data.length} total. ${active.map((g: Record<string, unknown>) => `"${g['title']}" (${g['category']}, ${g['priority']})`).join(', ')}`;
  }

  private async getTasksSummary(): Promise<string> {
    const { data } = await this.client
      .from('planner_tasks')
      .select('title, status, due_date, category')
      .eq('user_id', this.userId!);
    if (!data || data.length === 0) return 'None';
    const today = new Date().toISOString().split('T')[0];
    const dueToday = data.filter((t: Record<string, unknown>) => t['due_date'] === today);
    const overdue = data.filter((t: Record<string, unknown>) =>
      t['due_date'] && (t['due_date'] as string) < today && t['status'] !== 'done');
    const done = data.filter((t: Record<string, unknown>) => t['status'] === 'done');
    return `${data.length} total, ${done.length} done, ${dueToday.length} due today, ${overdue.length} overdue`;
  }

  private async getCapturesSummary(): Promise<string> {
    const { count } = await this.client
      .from('jarvis_captures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId!)
      .eq('status', 'pending');
    return `${count || 0} pending`;
  }

  private async getPostsSummary(): Promise<string> {
    const { data } = await this.client
      .from('automation_posts')
      .select('status, created_at')
      .eq('user_id', this.userId!)
      .order('created_at', { ascending: false })
      .limit(5);
    if (!data || data.length === 0) return 'No posts';
    const drafts = data.filter((p: Record<string, unknown>) => p['status'] === 'draft');
    const posted = data.filter((p: Record<string, unknown>) => p['status'] === 'posted');
    const lastPosted = posted[0];
    const daysSince = lastPosted
      ? Math.floor((Date.now() - new Date(lastPosted['created_at'] as string).getTime()) / 86400000)
      : -1;
    return `${drafts.length} drafts, ${daysSince >= 0 ? daysSince + ' days since last post' : 'no posts yet'}`;
  }

  private async getFocusSummary(): Promise<string> {
    const weekStart = this.getWeekStart();
    const { data } = await this.client
      .from('jarvis_focus_sessions')
      .select('actual_duration_minutes, status')
      .eq('user_id', this.userId!)
      .gte('started_at', weekStart.toISOString());
    if (!data || data.length === 0) return 'None this week';
    const completed = data.filter((s: Record<string, unknown>) => s['status'] === 'completed');
    const totalMin = completed.reduce((sum: number, s: Record<string, unknown>) =>
      sum + ((s['actual_duration_minutes'] as number) || 0), 0);
    return `${completed.length} sessions, ${Math.round(totalMin / 60 * 10) / 10} hours this week`;
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
