import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';

@Injectable({ providedIn: 'root' })
export class HealthDataService {
  private supabase = inject(SupabaseService);
  private get client() { return this.supabase.client; }
  private get userId() { return this.supabase.currentUser()?.id; }

  async getHealthSummary(): Promise<string> {
    if (!this.userId) return 'Health data unavailable (not authenticated)';

    const [vitals, flaggedLabs, activeMeds, todayLog] = await Promise.all([
      this.getRecentVitalsSummary(),
      this.getRecentFlaggedLabCount(),
      this.getActiveMedCount(),
      this.getTodayLogSummary(),
    ]);

    const lines = [
      `Avg resting HR (7d): ${vitals.restingHr ?? 'N/A'} bpm`,
      `Avg sleep (7d): ${vitals.sleepHours ?? 'N/A'} hours`,
      `Steps today: ${vitals.stepsToday ?? 'N/A'}`,
      `Flagged labs (30d): ${flaggedLabs}`,
      `Active medications: ${activeMeds}`,
      `Today wellness: ${todayLog}`,
    ];

    return lines.join('\n');
  }

  private async getRecentVitalsSummary(): Promise<{
    restingHr: string | null;
    sleepHours: string | null;
    stepsToday: string | null;
  }> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await this.client
      .from('health_vitals')
      .select('metric_type, value')
      .eq('user_id', this.userId!)
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .in('metric_type', ['resting_hr', 'sleep_hours', 'steps']);

    if (!data || data.length === 0) {
      return { restingHr: null, sleepHours: null, stepsToday: null };
    }

    const grouped = new Map<string, number[]>();
    for (const row of data) {
      if (!grouped.has(row.metric_type)) grouped.set(row.metric_type, []);
      grouped.get(row.metric_type)!.push(row.value);
    }

    const avg = (arr: number[] | undefined) =>
      arr ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : null;

    return {
      restingHr: avg(grouped.get('resting_hr')),
      sleepHours: avg(grouped.get('sleep_hours')),
      stepsToday: grouped.get('steps')?.[0]?.toString() ?? null,
    };
  }

  private async getRecentFlaggedLabCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count } = await this.client
      .from('health_lab_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId!)
      .eq('is_flagged', true)
      .gte('lab_date', thirtyDaysAgo.toISOString().split('T')[0]);

    return count ?? 0;
  }

  private async getActiveMedCount(): Promise<number> {
    const { count } = await this.client
      .from('health_medications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId!)
      .eq('is_active', true);

    return count ?? 0;
  }

  private async getTodayLogSummary(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('health_daily_log')
      .select('mood_score, energy_score, stress_score')
      .eq('user_id', this.userId!)
      .eq('log_date', today)
      .single();

    if (!data) return 'not logged';
    return `mood ${data.mood_score ?? '?'}/10, energy ${data.energy_score ?? '?'}/10, stress ${data.stress_score ?? '?'}/10`;
  }
}
