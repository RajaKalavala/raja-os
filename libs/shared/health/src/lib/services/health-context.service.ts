import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';

@Injectable({ providedIn: 'root' })
export class HealthContextService {
  private supabase = inject(SupabaseService);
  private get client() { return this.supabase.client; }
  private get userId() { return this.supabase.currentUser()?.id; }

  async buildContext(): Promise<string> {
    if (!this.userId) return 'No user authenticated.';

    const [profile, recentVitals, flaggedLabs, activeMeds, dailyLog] = await Promise.all([
      this.getProfileContext(),
      this.getRecentVitalsContext(),
      this.getFlaggedLabsContext(),
      this.getActiveMedsContext(),
      this.getDailyLogContext(),
    ]);

    return [
      '--- HEALTH PROFILE ---',
      profile,
      '',
      '--- RECENT VITALS (7 days) ---',
      recentVitals,
      '',
      '--- FLAGGED LAB RESULTS ---',
      flaggedLabs,
      '',
      '--- ACTIVE MEDICATIONS ---',
      activeMeds,
      '',
      '--- TODAY WELLNESS LOG ---',
      dailyLog,
    ].join('\n');
  }

  private async getProfileContext(): Promise<string> {
    const { data } = await this.client
      .from('health_profile')
      .select('*')
      .eq('user_id', this.userId!)
      .single();

    if (!data) return 'No health profile set up.';

    const lines = [];
    if (data.blood_type) lines.push(`Blood type: ${data.blood_type}`);
    if (data.height_cm) lines.push(`Height: ${data.height_cm} cm`);
    if (data.date_of_birth) lines.push(`DOB: ${data.date_of_birth}`);
    if (data.chronic_conditions?.length) lines.push(`Chronic conditions: ${data.chronic_conditions.join(', ')}`);
    if (data.allergies?.length) lines.push(`Allergies: ${data.allergies.map((a: any) => `${a.substance} (${a.severity})`).join(', ')}`);
    return lines.length > 0 ? lines.join('\n') : 'Profile exists but minimal data.';
  }

  private async getRecentVitalsContext(): Promise<string> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await this.client
      .from('health_vitals')
      .select('metric_type, value, unit, recorded_at')
      .eq('user_id', this.userId!)
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) return 'No vitals data in last 7 days.';

    // Group by metric type and get latest + average
    const grouped = new Map<string, number[]>();
    for (const row of data) {
      if (!grouped.has(row.metric_type)) grouped.set(row.metric_type, []);
      grouped.get(row.metric_type)!.push(row.value);
    }

    const lines: string[] = [];
    for (const [metric, values] of grouped) {
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
      const latest = values[0];
      lines.push(`${metric}: latest=${latest}, avg=${avg} (${values.length} readings)`);
    }
    return lines.join('\n');
  }

  private async getFlaggedLabsContext(): Promise<string> {
    const { data } = await this.client
      .from('health_lab_results')
      .select('biomarker_name, value, unit, reference_low, reference_high, flag_direction, lab_date')
      .eq('user_id', this.userId!)
      .eq('is_flagged', true)
      .order('lab_date', { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return 'No flagged lab results.';

    return data.map(r =>
      `${r.biomarker_name}: ${r.value} ${r.unit} (ref: ${r.reference_low}-${r.reference_high}, ${r.flag_direction}) on ${r.lab_date}`
    ).join('\n');
  }

  private async getActiveMedsContext(): Promise<string> {
    const { data } = await this.client
      .from('health_medications')
      .select('name, category, dosage, frequency, prescribed_for')
      .eq('user_id', this.userId!)
      .eq('is_active', true);

    if (!data || data.length === 0) return 'No active medications.';

    return data.map(m =>
      `${m.name} (${m.category}): ${m.dosage}, ${m.frequency}${m.prescribed_for ? ` for ${m.prescribed_for}` : ''}`
    ).join('\n');
  }

  private async getDailyLogContext(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('health_daily_log')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('log_date', today)
      .single();

    if (!data) return 'Not logged today.';

    const parts = [];
    if (data.mood_score) parts.push(`Mood: ${data.mood_score}/10`);
    if (data.energy_score) parts.push(`Energy: ${data.energy_score}/10`);
    if (data.stress_score) parts.push(`Stress: ${data.stress_score}/10`);
    if (data.sleep_quality) parts.push(`Sleep quality: ${data.sleep_quality}/10`);
    if (data.symptoms?.length) parts.push(`Symptoms: ${data.symptoms.join(', ')}`);
    if (data.notes) parts.push(`Notes: ${data.notes}`);
    return parts.join('\n');
  }
}
