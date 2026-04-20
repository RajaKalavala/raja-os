import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import {
  WorkoutSession, WorkoutExercise, ExerciseSet, BodyWeightLog,
  ExerciseDefinition, PersonalRecord, FitnessStats, MuscleGroup,
  WorkoutSplitType,
} from '../models/health.models';

@Injectable({ providedIn: 'root' })
export class HealthFitnessService {
  private supabase = inject(SupabaseService);
  private get client() { return this.supabase.client; }
  private get userId() { return this.supabase.currentUser()?.id; }

  readonly workouts = signal<WorkoutSession[]>([]);
  readonly bodyWeightHistory = signal<BodyWeightLog[]>([]);
  readonly personalRecords = signal<PersonalRecord[]>([]);
  readonly stats = signal<FitnessStats>({
    workoutsThisWeek: 0, workoutsThisMonth: 0, currentStreak: 0,
    totalVolumeWeek: 0, latestBodyWeight: null, bodyWeightChange7d: null,
  });

  // ─── Predefined Exercise Library ─────────────────────
  readonly exerciseLibrary: ExerciseDefinition[] = [
    // Chest
    { name: 'Bench Press', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Incline Bench Press', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Dumbbell Press', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Incline Dumbbell Press', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Chest Fly', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Cable Crossover', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Push-Up', muscleGroup: 'chest', type: 'strength', isCustom: false },
    { name: 'Dips (Chest)', muscleGroup: 'chest', type: 'strength', isCustom: false },
    // Back
    { name: 'Deadlift', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Barbell Row', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Pull-Up', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Lat Pulldown', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Seated Row', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'T-Bar Row', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Dumbbell Row', muscleGroup: 'back', type: 'strength', isCustom: false },
    { name: 'Face Pull', muscleGroup: 'back', type: 'strength', isCustom: false },
    // Legs
    { name: 'Squat', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Leg Press', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Lunges', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Romanian Deadlift', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Leg Curl', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Leg Extension', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Calf Raises', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Bulgarian Split Squat', muscleGroup: 'legs', type: 'strength', isCustom: false },
    { name: 'Hip Thrust', muscleGroup: 'legs', type: 'strength', isCustom: false },
    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Lateral Raise', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Front Raise', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Reverse Fly', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Shrugs', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    { name: 'Arnold Press', muscleGroup: 'shoulders', type: 'strength', isCustom: false },
    // Arms
    { name: 'Bicep Curl', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Hammer Curl', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Preacher Curl', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Tricep Pushdown', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Skull Crusher', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Tricep Dips', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Concentration Curl', muscleGroup: 'arms', type: 'strength', isCustom: false },
    { name: 'Cable Curl', muscleGroup: 'arms', type: 'strength', isCustom: false },
    // Core
    { name: 'Plank', muscleGroup: 'core', type: 'strength', isCustom: false },
    { name: 'Crunches', muscleGroup: 'core', type: 'strength', isCustom: false },
    { name: 'Hanging Leg Raises', muscleGroup: 'core', type: 'strength', isCustom: false },
    { name: 'Russian Twist', muscleGroup: 'core', type: 'strength', isCustom: false },
    { name: 'Ab Wheel Rollout', muscleGroup: 'core', type: 'strength', isCustom: false },
    { name: 'Cable Woodchop', muscleGroup: 'core', type: 'strength', isCustom: false },
    // Cardio
    { name: 'Running', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Cycling', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Rowing Machine', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Elliptical', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Stair Climber', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Jump Rope', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Swimming', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Walking', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'HIIT', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
    { name: 'Battle Ropes', muscleGroup: 'cardio', type: 'cardio', isCustom: false },
  ];

  readonly customExercises = signal<ExerciseDefinition[]>([]);

  readonly allExercises = computed(() => [
    ...this.exerciseLibrary,
    ...this.customExercises(),
  ]);

  // ─── Load All Data ───────────────────────────────────
  async loadAll(): Promise<void> {
    await Promise.all([
      this.loadWorkouts(),
      this.loadBodyWeight(),
      this.loadCustomExercises(),
    ]);
    this.computeStats();
    this.computePRs();
  }

  // ─── Workouts ────────────────────────────────────────
  async loadWorkouts(): Promise<void> {
    if (!this.userId) return;
    const { data } = await this.client
      .from('health_workouts')
      .select('*, health_workout_exercises(*)')
      .eq('user_id', this.userId)
      .order('workout_date', { ascending: false })
      .limit(100);

    if (data) {
      this.workouts.set(data.map(row => this.toWorkoutSession(row)));
    }
  }

  async saveWorkout(session: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    if (!this.userId) return;

    const { data: workoutRow, error } = await this.client
      .from('health_workouts')
      .insert({
        user_id: this.userId,
        workout_date: session.workoutDate,
        split_type: session.splitType,
        duration_minutes: session.durationMinutes,
        energy_level: session.energyLevel,
        notes: session.notes,
      })
      .select()
      .single();

    if (error || !workoutRow) return;

    if (session.exercises.length > 0) {
      const exerciseRows = session.exercises.map((ex, i) => ({
        user_id: this.userId,
        session_id: workoutRow.id,
        exercise_name: ex.exerciseName,
        muscle_group: ex.muscleGroup,
        exercise_type: ex.exerciseType,
        sets: ex.sets,
        distance_km: ex.distanceKm,
        duration_minutes: ex.durationMinutes,
        order_index: i,
        notes: ex.notes,
      }));

      await this.client.from('health_workout_exercises').insert(exerciseRows);
    }

    await this.loadWorkouts();
    this.computeStats();
    this.computePRs();
  }

  async deleteWorkout(id: string): Promise<void> {
    await this.client.from('health_workouts').delete().eq('id', id);
    this.workouts.update(list => list.filter(w => w.id !== id));
    this.computeStats();
    this.computePRs();
  }

  // ─── Body Weight ─────────────────────────────────────
  async loadBodyWeight(): Promise<void> {
    if (!this.userId) return;
    const { data } = await this.client
      .from('health_body_weight')
      .select('*')
      .eq('user_id', this.userId)
      .order('log_date', { ascending: false })
      .limit(365);

    if (data) {
      this.bodyWeightHistory.set(data.map(row => ({
        id: row.id,
        userId: row.user_id,
        logDate: row.log_date,
        weightKg: Number(row.weight_kg),
        notes: row.notes,
        createdAt: new Date(row.created_at),
      })));
    }
  }

  async logBodyWeight(date: string, weightKg: number, notes?: string): Promise<void> {
    if (!this.userId) return;

    await this.client
      .from('health_body_weight')
      .upsert({
        user_id: this.userId,
        log_date: date,
        weight_kg: weightKg,
        notes: notes || null,
      }, { onConflict: 'user_id,log_date' });

    await this.loadBodyWeight();
    this.computeStats();
  }

  // ─── Custom Exercises ────────────────────────────────
  async loadCustomExercises(): Promise<void> {
    if (!this.userId) return;
    const { data } = await this.client
      .from('health_exercise_library')
      .select('*')
      .eq('user_id', this.userId);

    if (data) {
      this.customExercises.set(data.map(row => ({
        name: row.name,
        muscleGroup: row.muscle_group as MuscleGroup,
        type: row.exercise_type as 'strength' | 'cardio',
        isCustom: true,
      })));
    }
  }

  async addCustomExercise(exercise: Omit<ExerciseDefinition, 'isCustom'>): Promise<void> {
    if (!this.userId) return;
    await this.client.from('health_exercise_library').insert({
      user_id: this.userId,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      exercise_type: exercise.type,
    });
    await this.loadCustomExercises();
  }

  // ─── Stats Computation ───────────────────────────────
  private computeStats(): void {
    const workouts = this.workouts();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStr = weekStart.toISOString().split('T')[0];
    const monthStr = monthStart.toISOString().split('T')[0];

    const thisWeek = workouts.filter(w => w.workoutDate >= weekStr);
    const thisMonth = workouts.filter(w => w.workoutDate >= monthStr);

    // Volume = sum of (reps * weight) for all sets this week
    let totalVolume = 0;
    for (const w of thisWeek) {
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          if (!s.isWarmup) totalVolume += s.reps * s.weightKg;
        }
      }
    }

    // Streak
    let streak = 0;
    const today = now.toISOString().split('T')[0];
    const workoutDates = new Set(workouts.map(w => w.workoutDate));
    const checkDate = new Date(now);
    // If no workout today, start checking from yesterday
    if (!workoutDates.has(today)) checkDate.setDate(checkDate.getDate() - 1);
    while (workoutDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Body weight
    const bw = this.bodyWeightHistory();
    const latestBW = bw.length > 0 ? bw[0].weightKg : null;
    let bwChange: number | null = null;
    if (bw.length >= 2) {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const oldEntry = bw.find(b => b.logDate <= sevenDaysAgo.toISOString().split('T')[0]);
      if (oldEntry && latestBW) bwChange = Math.round((latestBW - oldEntry.weightKg) * 10) / 10;
    }

    this.stats.set({
      workoutsThisWeek: thisWeek.length,
      workoutsThisMonth: thisMonth.length,
      currentStreak: streak,
      totalVolumeWeek: Math.round(totalVolume),
      latestBodyWeight: latestBW,
      bodyWeightChange7d: bwChange,
    });
  }

  // ─── Personal Records ────────────────────────────────
  private computePRs(): void {
    const prMap = new Map<string, PersonalRecord>();
    for (const w of this.workouts()) {
      for (const ex of w.exercises) {
        if (ex.exerciseType !== 'strength') continue;
        for (const s of ex.sets) {
          if (s.isWarmup) continue;
          const key = ex.exerciseName;
          const existing = prMap.get(key);
          if (!existing || s.weightKg > existing.maxWeight) {
            prMap.set(key, {
              exerciseName: key,
              maxWeight: s.weightKg,
              reps: s.reps,
              date: w.workoutDate,
            });
          }
        }
      }
    }
    this.personalRecords.set(Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight));
  }

  // ─── Chart Data Helpers ──────────────────────────────
  getBodyWeightChartData(days: number = 90): { dates: string[]; values: number[] } {
    const bw = this.bodyWeightHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered = bw.filter(b => b.logDate >= cutoffStr).reverse();
    return {
      dates: filtered.map(b => b.logDate),
      values: filtered.map(b => b.weightKg),
    };
  }

  getExerciseProgressData(exerciseName: string): { dates: string[]; values: number[] } {
    const points: { date: string; maxWeight: number }[] = [];
    for (const w of this.workouts()) {
      for (const ex of w.exercises) {
        if (ex.exerciseName === exerciseName && ex.exerciseType === 'strength') {
          const maxW = Math.max(...ex.sets.filter(s => !s.isWarmup).map(s => s.weightKg), 0);
          if (maxW > 0) points.push({ date: w.workoutDate, maxWeight: maxW });
        }
      }
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    return {
      dates: points.map(p => p.date),
      values: points.map(p => p.maxWeight),
    };
  }

  getWorkoutFrequencyData(weeks: number = 8): { labels: string[]; values: number[] } {
    const result: { labels: string[]; values: number[] } = { labels: [], values: [] };
    const now = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];
      const count = this.workouts().filter(w => w.workoutDate >= startStr && w.workoutDate <= endStr).length;
      result.labels.push(`${weekStart.getMonth() + 1}/${weekStart.getDate()}`);
      result.values.push(count);
    }
    return result;
  }

  getMuscleGroupVolumeData(): { groups: string[]; volumes: number[] } {
    const volumeMap = new Map<string, number>();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 30);
    const cutoff = weekStart.toISOString().split('T')[0];

    for (const w of this.workouts().filter(w => w.workoutDate >= cutoff)) {
      for (const ex of w.exercises) {
        if (ex.exerciseType !== 'strength') continue;
        const vol = ex.sets.reduce((sum, s) => sum + (s.isWarmup ? 0 : s.reps * s.weightKg), 0);
        volumeMap.set(ex.muscleGroup, (volumeMap.get(ex.muscleGroup) || 0) + vol);
      }
    }

    const entries = Array.from(volumeMap.entries()).sort((a, b) => b[1] - a[1]);
    return {
      groups: entries.map(e => e[0].charAt(0).toUpperCase() + e[0].slice(1)),
      volumes: entries.map(e => Math.round(e[1])),
    };
  }

  // ─── Helpers ─────────────────────────────────────────
  private toWorkoutSession(row: any): WorkoutSession {
    const exercises: WorkoutExercise[] = (row.health_workout_exercises || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((ex: any) => ({
        id: ex.id,
        sessionId: ex.session_id,
        exerciseName: ex.exercise_name,
        muscleGroup: ex.muscle_group,
        exerciseType: ex.exercise_type,
        sets: ex.sets || [],
        distanceKm: ex.distance_km,
        durationMinutes: ex.duration_minutes,
        orderIndex: ex.order_index,
        notes: ex.notes,
      }));

    return {
      id: row.id,
      userId: row.user_id,
      workoutDate: row.workout_date,
      splitType: row.split_type,
      durationMinutes: row.duration_minutes,
      energyLevel: row.energy_level,
      notes: row.notes,
      exercises,
      createdAt: new Date(row.created_at),
    };
  }
}
