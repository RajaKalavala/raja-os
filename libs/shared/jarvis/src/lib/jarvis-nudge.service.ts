import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import { JarvisNudge, NudgeType } from './jarvis.models';

@Injectable({ providedIn: 'root' })
export class JarvisNudgeService {
  private supabase = inject(SupabaseService);

  private get client() {
    return this.supabase.client;
  }

  private get userId() {
    return this.supabase.currentUser()?.id;
  }

  readonly nudges = signal<JarvisNudge[]>([]);
  readonly unreadCount = computed(() =>
    this.nudges().filter((n) => !n.isRead && !n.isDismissed).length
  );

  async loadNudges(): Promise<void> {
    if (!this.userId) return;
    const now = new Date().toISOString();
    const { data } = await this.client
      .from('jarvis_nudges')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_dismissed', false)
      .or(`snoozed_until.is.null,snoozed_until.lte.${now}`)
      .order('created_at', { ascending: false })
      .limit(20);

    this.nudges.set((data || []).map(this.toNudge));
  }

  async markAsRead(id: string): Promise<void> {
    await this.client
      .from('jarvis_nudges')
      .update({ is_read: true })
      .eq('id', id);
    this.nudges.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async dismissNudge(id: string): Promise<void> {
    await this.client
      .from('jarvis_nudges')
      .update({ is_dismissed: true })
      .eq('id', id);
    this.nudges.update((list) => list.filter((n) => n.id !== id));
  }

  async snoozeNudge(id: string, hours: number): Promise<void> {
    const until = new Date(Date.now() + hours * 3600000).toISOString();
    await this.client
      .from('jarvis_nudges')
      .update({ snoozed_until: until })
      .eq('id', id);
    this.nudges.update((list) => list.filter((n) => n.id !== id));
  }

  async markAllAsRead(): Promise<void> {
    if (!this.userId) return;
    await this.client
      .from('jarvis_nudges')
      .update({ is_read: true })
      .eq('user_id', this.userId)
      .eq('is_read', false);
    this.nudges.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }

  // ─── Nudge Generation ─────────────────────────────────

  async generateNudges(): Promise<void> {
    if (!this.userId) return;

    const checks = await Promise.all([
      this.checkOverdueGoals(),
      this.checkHabitStreaksAtRisk(),
      this.checkNoFocusSession(),
      this.checkWeeklyReviewDue(),
      this.checkAgingIdeas(),
      this.checkLabsOutOfRange(),
      this.checkHealthLogMissing(),
      this.checkVitalsDataStale(),
    ]);

    const newNudges = checks.flat().filter(Boolean) as {
      type: NudgeType;
      message: string;
      actionLabel: string;
      actionRoute: string;
      priority: 'high' | 'medium' | 'low';
    }[];

    for (const nudge of newNudges) {
      // Avoid duplicate nudges of same type created today
      const today = new Date().toISOString().split('T')[0];
      const { count } = await this.client
        .from('jarvis_nudges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('nudge_type', nudge.type)
        .gte('created_at', `${today}T00:00:00`);

      if ((count || 0) === 0) {
        await this.client.from('jarvis_nudges').insert({
          user_id: this.userId,
          nudge_type: nudge.type,
          message: nudge.message,
          action_label: nudge.actionLabel,
          action_route: nudge.actionRoute,
          priority: nudge.priority,
        });
      }
    }

    await this.loadNudges();
  }

  private async checkOverdueGoals() {
    if (!this.userId) return [];
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('planner_goals')
      .select('title, target_date')
      .eq('user_id', this.userId)
      .eq('status', 'active')
      .lt('target_date', today)
      .limit(3);

    if (!data || data.length === 0) return [];
    const count = data.length;
    return [
      {
        type: 'goal_overdue' as NudgeType,
        message: `${count} goal${count > 1 ? 's' : ''} overdue: "${data[0]['title']}"${count > 1 ? ` +${count - 1} more` : ''}`,
        actionLabel: 'View Goals',
        actionRoute: '/planner',
        priority: 'high' as const,
      },
    ];
  }

  private async checkHabitStreaksAtRisk() {
    if (!this.userId) return [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get active habits
    const { data: habits } = await this.client
      .from('jarvis_habits')
      .select('id, name')
      .eq('user_id', this.userId)
      .eq('is_active', true);

    if (!habits || habits.length === 0) return [];

    // Check which habits were NOT completed yesterday
    const { data: logs } = await this.client
      .from('jarvis_habit_logs')
      .select('habit_id')
      .eq('user_id', this.userId)
      .eq('logged_date', yesterdayStr)
      .eq('completed', true);

    const completedIds = new Set(
      (logs || []).map((l: Record<string, unknown>) => l['habit_id'])
    );
    const missed = habits.filter(
      (h: Record<string, unknown>) => !completedIds.has(h['id'] as string)
    );

    if (missed.length === 0) return [];
    return [
      {
        type: 'habit_streak_at_risk' as NudgeType,
        message: `${missed.length} habit${missed.length > 1 ? 's' : ''} missed yesterday — streak at risk!`,
        actionLabel: 'Check Habits',
        actionRoute: '/planner',
        priority: 'medium' as const,
      },
    ];
  }

  private async checkNoFocusSession() {
    if (!this.userId) return [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await this.client
      .from('jarvis_focus_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .gte('started_at', todayStart.toISOString());

    if ((count || 0) > 0) return [];

    // Only nudge after 10 AM
    if (new Date().getHours() < 10) return [];

    return [
      {
        type: 'no_focus_session' as NudgeType,
        message: 'No focus session today. Time to lock in?',
        actionLabel: 'Start Focus',
        actionRoute: '/jarvis',
        priority: 'low' as const,
      },
    ];
  }

  private async checkWeeklyReviewDue() {
    if (!this.userId) return [];
    const dayOfWeek = new Date().getDay();
    // Only suggest on Sunday (0) or Saturday (6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) return [];

    const { data } = await this.client
      .from('jarvis_weekly_reviews')
      .select('review_date')
      .eq('user_id', this.userId)
      .order('review_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const lastReview = new Date(data['review_date'] as string);
      const daysSince = Math.floor(
        (Date.now() - lastReview.getTime()) / 86400000
      );
      if (daysSince < 6) return [];
    }

    return [
      {
        type: 'weekly_review_due' as NudgeType,
        message: "Time for your weekly review — reflect on wins and learnings.",
        actionLabel: 'Start Review',
        actionRoute: '/jarvis',
        priority: 'medium' as const,
      },
    ];
  }

  private async checkAgingIdeas() {
    if (!this.userId) return [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count } = await this.client
      .from('planner_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('status', 'new')
      .lte('created_at', thirtyDaysAgo.toISOString());

    if (!count || count === 0) return [];

    return [
      {
        type: 'ideas_aging' as NudgeType,
        message: `${count} idea${count > 1 ? 's' : ''} sitting for 30+ days. Review or archive?`,
        actionLabel: 'Review Ideas',
        actionRoute: '/planner',
        priority: 'low' as const,
      },
    ];
  }

  // ─── Health Nudge Checks ───────────────────────────────

  private async checkLabsOutOfRange() {
    if (!this.userId) return [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await this.client
      .from('health_lab_results')
      .select('biomarker_name, flag_direction, lab_date')
      .eq('user_id', this.userId)
      .eq('is_flagged', true)
      .gte('lab_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('lab_date', { ascending: false })
      .limit(3);

    if (!data || data.length === 0) return [];
    return [{
      type: 'labs_out_of_range' as NudgeType,
      message: `${data.length} lab result${data.length > 1 ? 's' : ''} flagged: "${data[0]['biomarker_name']}" is ${data[0]['flag_direction']}`,
      actionLabel: 'View Lab Results',
      actionRoute: '/health/labs',
      priority: 'high' as const,
    }];
  }

  private async checkHealthLogMissing() {
    if (!this.userId) return [];
    if (new Date().getHours() < 20) return [];

    const today = new Date().toISOString().split('T')[0];
    const { count } = await this.client
      .from('health_daily_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('log_date', today);

    if ((count || 0) > 0) return [];
    return [{
      type: 'health_log_missing' as NudgeType,
      message: "How are you feeling today? Your daily health log is empty.",
      actionLabel: 'Log Today',
      actionRoute: '/health',
      priority: 'low' as const,
    }];
  }

  private async checkVitalsDataStale() {
    if (!this.userId) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count } = await this.client
      .from('health_vitals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .gte('recorded_at', sevenDaysAgo.toISOString());

    if ((count || 0) > 0) return [];
    return [{
      type: 'vitals_data_stale' as NudgeType,
      message: 'No health vitals data in 7+ days. Time to import from Apple Health?',
      actionLabel: 'Import Data',
      actionRoute: '/health/vitals',
      priority: 'medium' as const,
    }];
  }

  // ─── Helpers ──────────────────────────────────────────

  private toNudge(row: Record<string, unknown>): JarvisNudge {
    return {
      id: row['id'] as string,
      type: row['nudge_type'] as NudgeType,
      message: row['message'] as string,
      actionLabel: (row['action_label'] as string) || '',
      actionRoute: (row['action_route'] as string) || '',
      priority: (row['priority'] as JarvisNudge['priority']) || 'medium',
      isRead: (row['is_read'] as boolean) || false,
      isDismissed: (row['is_dismissed'] as boolean) || false,
      snoozedUntil: row['snoozed_until']
        ? new Date(row['snoozed_until'] as string)
        : null,
      createdAt: new Date(row['created_at'] as string),
    };
  }
}
