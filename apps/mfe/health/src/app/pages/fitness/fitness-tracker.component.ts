import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import {
  HealthFitnessService, ExerciseDefinition, ExerciseSet,
  WorkoutSession, WorkoutSplitType, MuscleGroup,
} from '@org/health';
import type { EChartsOption } from 'echarts';

interface PendingExercise {
  exercise: ExerciseDefinition;
  sets: ExerciseSet[];
  distanceKm: number | null;
  durationMinutes: number | null;
  notes: string;
}

@Component({
  selector: 'raja-fitness-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsDirective],
  template: `
    <div class="fitness-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Fitness Tracker</h1>
          <p class="subtitle">Log workouts, track progress, crush goals</p>
        </div>
        <button class="btn-primary" (click)="showLogForm.set(!showLogForm())">
          {{ showLogForm() ? 'Cancel' : '+ Log Workout' }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ fitness.stats().workoutsThisWeek }}</span>
          <span class="stat-label">This Week</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ fitness.stats().workoutsThisMonth }}</span>
          <span class="stat-label">This Month</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ fitness.stats().currentStreak }}d</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ (fitness.stats().totalVolumeWeek / 1000).toFixed(1) }}t</span>
          <span class="stat-label">Volume (wk)</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ fitness.stats().latestBodyWeight ?? '--' }}</span>
          <span class="stat-label">Weight (kg)</span>
          <span class="stat-change" *ngIf="fitness.stats().bodyWeightChange7d !== null"
            [class.positive]="fitness.stats().bodyWeightChange7d! > 0"
            [class.negative]="fitness.stats().bodyWeightChange7d! < 0">
            {{ fitness.stats().bodyWeightChange7d! > 0 ? '+' : '' }}{{ fitness.stats().bodyWeightChange7d }}
          </span>
        </div>
      </div>

      <!-- Log Workout Form -->
      <div class="log-form card" *ngIf="showLogForm()">
        <h3>Log Workout</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="formDate">
          </div>
          <div class="form-group">
            <label>Split</label>
            <select [(ngModel)]="formSplit">
              <option *ngFor="let s of splitTypes" [value]="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Duration (min)</label>
            <input type="number" [(ngModel)]="formDuration" min="1" placeholder="60">
          </div>
          <div class="form-group">
            <label>Energy (1-5)</label>
            <div class="energy-selector">
              <button *ngFor="let e of [1,2,3,4,5]" (click)="formEnergy = e"
                [class.active]="formEnergy === e" class="energy-btn">{{ e }}</button>
            </div>
          </div>
        </div>

        <!-- Add Exercises -->
        <div class="exercises-section">
          <div class="exercise-header">
            <h4>Exercises</h4>
            <div class="exercise-add-row">
              <div class="exercise-search-wrapper">
                <input type="text" [(ngModel)]="exerciseSearch" placeholder="Search exercise..."
                  (focus)="showExerciseDropdown.set(true)" class="exercise-search">
                <div class="exercise-dropdown" *ngIf="showExerciseDropdown() && filteredExercises().length > 0">
                  <div class="exercise-group" *ngFor="let group of groupedFilteredExercises()">
                    <div class="group-label">{{ group.label }}</div>
                    <button *ngFor="let ex of group.exercises" class="exercise-option"
                      (click)="addExercise(ex)">
                      {{ ex.name }}
                      <span class="ex-type-tag" [class.cardio]="ex.type === 'cardio'">{{ ex.type }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <button class="btn-small" (click)="showAddCustom.set(true)" title="Add custom exercise">+Custom</button>
            </div>
          </div>

          <!-- Custom Exercise Form -->
          <div class="custom-exercise-form" *ngIf="showAddCustom()">
            <input type="text" [(ngModel)]="customName" placeholder="Exercise name">
            <select [(ngModel)]="customMuscle">
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
              <option value="core">Core</option>
              <option value="cardio">Cardio</option>
            </select>
            <select [(ngModel)]="customType">
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
            </select>
            <button class="btn-small" (click)="saveCustomExercise()">Add</button>
            <button class="btn-small cancel" (click)="showAddCustom.set(false)">X</button>
          </div>

          <!-- Pending Exercises List -->
          <div class="pending-exercises">
            <div class="pending-exercise" *ngFor="let pe of pendingExercises; let i = index">
              <div class="pe-header">
                <span class="pe-name">{{ pe.exercise.name }}</span>
                <span class="pe-muscle">{{ pe.exercise.muscleGroup }}</span>
                <button class="btn-remove" (click)="removeExercise(i)">x</button>
              </div>

              <!-- Strength Sets -->
              <div class="sets-table" *ngIf="pe.exercise.type === 'strength'">
                <div class="set-row header">
                  <span>Set</span><span>Reps</span><span>Weight (kg)</span><span>Warmup</span><span></span>
                </div>
                <div class="set-row" *ngFor="let s of pe.sets; let si = index">
                  <span class="set-num">{{ s.setNumber }}</span>
                  <input type="number" [(ngModel)]="s.reps" min="1" placeholder="10">
                  <input type="number" [(ngModel)]="s.weightKg" min="0" step="2.5" placeholder="0">
                  <input type="checkbox" [(ngModel)]="s.isWarmup">
                  <button class="btn-remove-sm" (click)="removeSet(pe, si)">-</button>
                </div>
                <button class="btn-add-set" (click)="addSet(pe)">+ Add Set</button>
              </div>

              <!-- Cardio Inputs -->
              <div class="cardio-inputs" *ngIf="pe.exercise.type === 'cardio'">
                <div class="form-group">
                  <label>Distance (km)</label>
                  <input type="number" [(ngModel)]="pe.distanceKm" step="0.1" placeholder="5.0">
                </div>
                <div class="form-group">
                  <label>Duration (min)</label>
                  <input type="number" [(ngModel)]="pe.durationMinutes" placeholder="30">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea [(ngModel)]="formNotes" rows="2" placeholder="How did the workout feel?"></textarea>
        </div>

        <button class="btn-primary save-btn" (click)="saveWorkout()"
          [disabled]="pendingExercises.length === 0">Save Workout</button>
      </div>

      <!-- Body Weight Logger -->
      <div class="bw-section card">
        <div class="bw-header">
          <h3>Body Weight</h3>
          <div class="bw-log-form">
            <input type="date" [(ngModel)]="bwDate">
            <input type="number" [(ngModel)]="bwWeight" step="0.1" placeholder="kg" class="bw-input">
            <button class="btn-small" (click)="logWeight()" [disabled]="!bwWeight">Log</button>
          </div>
        </div>
        <div class="chart-container" *ngIf="bodyWeightChartOptions">
          <div echarts [options]="bodyWeightChartOptions" class="chart"></div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="card chart-card">
          <h3>Workout Frequency</h3>
          <div echarts [options]="frequencyChartOptions" class="chart" *ngIf="frequencyChartOptions"></div>
        </div>
        <div class="card chart-card">
          <h3>Volume by Muscle Group (30d)</h3>
          <div echarts [options]="volumeChartOptions" class="chart" *ngIf="volumeChartOptions"></div>
        </div>
      </div>

      <!-- Strength Progress -->
      <div class="card" *ngIf="fitness.personalRecords().length > 0">
        <div class="progress-header">
          <h3>Strength Progress</h3>
          <select [(ngModel)]="selectedExercise" (ngModelChange)="updateProgressChart()">
            <option value="">Select exercise</option>
            <option *ngFor="let pr of fitness.personalRecords()" [value]="pr.exerciseName">
              {{ pr.exerciseName }}
            </option>
          </select>
        </div>
        <div echarts [options]="progressChartOptions" class="chart" *ngIf="progressChartOptions"></div>
      </div>

      <!-- Personal Records -->
      <div class="card" *ngIf="fitness.personalRecords().length > 0">
        <h3>Personal Records</h3>
        <div class="pr-grid">
          <div class="pr-card" *ngFor="let pr of fitness.personalRecords().slice(0, 12)">
            <span class="pr-exercise">{{ pr.exerciseName }}</span>
            <span class="pr-weight">{{ pr.maxWeight }} kg</span>
            <span class="pr-detail">{{ pr.reps }} reps &middot; {{ pr.date }}</span>
          </div>
        </div>
      </div>

      <!-- Workout History -->
      <div class="card">
        <h3>Recent Workouts</h3>
        <div class="history-empty" *ngIf="fitness.workouts().length === 0">
          <p>No workouts logged yet. Hit that "Log Workout" button!</p>
        </div>
        <div class="history-list">
          <div class="workout-card" *ngFor="let w of fitness.workouts().slice(0, 20)"
            (click)="toggleExpand(w.id)">
            <div class="wk-header">
              <div class="wk-left">
                <span class="wk-split">{{ w.splitType | titlecase }}</span>
                <span class="wk-date">{{ w.workoutDate }}</span>
              </div>
              <div class="wk-right">
                <span class="wk-duration">{{ w.durationMinutes }} min</span>
                <span class="wk-energy">
                  <span *ngFor="let e of [1,2,3,4,5]" [class.filled]="e <= w.energyLevel" class="energy-dot"></span>
                </span>
              </div>
            </div>
            <div class="wk-exercises-summary">
              {{ w.exercises.length }} exercise{{ w.exercises.length !== 1 ? 's' : '' }}:
              {{ getExerciseNames(w) }}
            </div>
            <div class="wk-detail" *ngIf="expandedWorkout() === w.id">
              <div class="wk-exercise" *ngFor="let ex of w.exercises">
                <span class="wk-ex-name">{{ ex.exerciseName }}</span>
                <div *ngIf="ex.exerciseType === 'strength'" class="wk-sets">
                  <span *ngFor="let s of ex.sets" class="wk-set" [class.warmup]="s.isWarmup">
                    {{ s.reps }}x{{ s.weightKg }}kg{{ s.isWarmup ? ' (W)' : '' }}
                  </span>
                </div>
                <div *ngIf="ex.exerciseType === 'cardio'" class="wk-cardio-detail">
                  {{ ex.distanceKm ? ex.distanceKm + ' km' : '' }}
                  {{ ex.durationMinutes ? ex.durationMinutes + ' min' : '' }}
                </div>
              </div>
              <p class="wk-notes" *ngIf="w.notes">{{ w.notes }}</p>
              <button class="btn-remove-workout" (click)="deleteWorkout(w.id, $event)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fitness-page { max-width: 1100px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); margin: 0 0 4px 0; }
      .subtitle { color: var(--text-secondary, #6b7280); font-size: 14px; margin: 0; }
    }

    .btn-primary {
      padding: 8px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
      background: var(--accent-green, #22c55e); color: white; cursor: pointer; transition: all 150ms;
      &:hover { background: var(--accent-green-dark, #16a34a); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-small {
      padding: 5px 12px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px;
      font-size: 12px; background: var(--bg-card, #fff); color: var(--text-primary, #111827);
      cursor: pointer; transition: all 150ms; white-space: nowrap;
      &:hover { border-color: var(--accent-green, #22c55e); }
      &.cancel { color: #ef4444; border-color: #ef4444; }
      &:disabled { opacity: 0.5; }
    }

    .card {
      background: var(--bg-card, #fff); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 12px; padding: 20px; margin-bottom: 20px;
      h3 { font-size: 16px; font-weight: 600; color: var(--text-primary, #111827); margin: 0 0 16px 0; }
    }

    /* Stats Row */
    .stats-row {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px; margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card, #fff); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px; padding: 16px; text-align: center; display: flex;
      flex-direction: column; align-items: center;
    }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); line-height: 1.2; }
    .stat-label { font-size: 11px; color: var(--text-tertiary, #9ca3af); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .stat-change { font-size: 11px; font-weight: 600; margin-top: 2px;
      &.positive { color: #22c55e; }
      &.negative { color: #ef4444; }
    }

    /* Log Form */
    .log-form h3 { margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .form-group {
      display: flex; flex-direction: column; gap: 4px;
      label { font-size: 12px; font-weight: 600; color: var(--text-secondary, #6b7280); }
      input, select, textarea {
        padding: 8px 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px;
        font-size: 13px; color: var(--text-primary, #111827); background: var(--bg-card, #fff);
        font-family: inherit;
        &:focus { outline: none; border-color: var(--accent-green, #22c55e); }
      }
      textarea { resize: vertical; }
    }
    .energy-selector { display: flex; gap: 4px; }
    .energy-btn {
      width: 32px; height: 32px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px;
      background: var(--bg-card, #fff); color: var(--text-primary); cursor: pointer; font-size: 13px;
      font-weight: 600; transition: all 150ms;
      &.active { background: var(--accent-green, #22c55e); color: white; border-color: transparent; }
    }

    /* Exercise Section */
    .exercises-section { margin-bottom: 16px; }
    .exercise-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
      h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
    }
    .exercise-add-row { display: flex; gap: 8px; align-items: center; }
    .exercise-search-wrapper { position: relative; }
    .exercise-search { width: 220px; padding: 6px 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px; font-size: 13px; }
    .exercise-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; max-height: 280px; overflow-y: auto;
      background: var(--bg-card, #fff); border: 1px solid var(--border-primary, #e5e7eb);
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 50; margin-top: 4px;
    }
    .group-label { padding: 6px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary, #9ca3af); background: var(--bg-card-alt, #f9fafb); }
    .exercise-option {
      display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 8px 12px;
      border: none; background: transparent; font-size: 13px; color: var(--text-primary);
      cursor: pointer; text-align: left;
      &:hover { background: var(--bg-card-alt, #f3f4f6); }
    }
    .ex-type-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: rgba(34,197,94,0.1); color: #22c55e;
      &.cardio { background: rgba(59,130,246,0.1); color: #3b82f6; }
    }

    /* Custom Exercise */
    .custom-exercise-form {
      display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;
      input, select { padding: 6px 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px; font-size: 13px; }
      input { flex: 1; min-width: 120px; }
    }

    /* Pending Exercises */
    .pending-exercise {
      background: var(--bg-card-alt, #f9fafb); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 8px; padding: 12px; margin-bottom: 10px;
    }
    .pe-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .pe-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .pe-muscle { font-size: 11px; color: var(--text-tertiary, #9ca3af); text-transform: uppercase; }
    .btn-remove { margin-left: auto; border: none; background: transparent; color: #ef4444; cursor: pointer; font-size: 16px; font-weight: 700; }

    /* Sets Table */
    .sets-table { font-size: 13px; }
    .set-row {
      display: grid; grid-template-columns: 40px 70px 90px 50px 30px; gap: 6px; align-items: center; margin-bottom: 4px;
      &.header { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; }
      input[type="number"] { padding: 4px 6px; border: 1px solid var(--border-light, #e5e7eb); border-radius: 4px; font-size: 13px; width: 100%; }
      input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    }
    .set-num { font-weight: 600; color: var(--text-secondary); text-align: center; }
    .btn-remove-sm { border: none; background: transparent; color: #ef4444; cursor: pointer; font-size: 14px; }
    .btn-add-set {
      padding: 4px 10px; border: 1px dashed var(--accent-green, #22c55e); border-radius: 4px;
      background: transparent; color: var(--accent-green); font-size: 12px; cursor: pointer; margin-top: 4px;
    }

    /* Cardio Inputs */
    .cardio-inputs { display: flex; gap: 12px;
      .form-group { flex: 1; }
    }

    .save-btn { width: 100%; padding: 10px; }

    /* Body Weight Section */
    .bw-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
      h3 { margin-bottom: 0 !important; }
    }
    .bw-log-form { display: flex; gap: 8px; align-items: center;
      input { padding: 6px 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px; font-size: 13px; }
      .bw-input { width: 80px; }
    }

    /* Charts */
    .chart-container { margin-top: 12px; }
    .chart { height: 250px; width: 100%; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .chart-card { min-height: 300px; }

    /* Strength Progress */
    .progress-header { display: flex; justify-content: space-between; align-items: center;
      select { padding: 6px 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px; font-size: 13px; }
    }

    /* PR Grid */
    .pr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
    .pr-card {
      display: flex; flex-direction: column; padding: 12px; background: var(--bg-card-alt, #f9fafb);
      border-radius: 8px; border: 1px solid var(--border-light, #e5e7eb);
    }
    .pr-exercise { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .pr-weight { font-size: 20px; font-weight: 700; color: var(--accent-green, #22c55e); }
    .pr-detail { font-size: 11px; color: var(--text-tertiary, #9ca3af); }

    /* History */
    .history-empty { padding: 32px; text-align: center; color: var(--text-secondary, #6b7280); }
    .workout-card {
      padding: 14px; border: 1px solid var(--border-light, #e5e7eb); border-radius: 10px;
      margin-bottom: 8px; cursor: pointer; transition: all 150ms;
      &:hover { border-color: var(--border-primary, #d1d5db); }
    }
    .wk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .wk-left { display: flex; align-items: center; gap: 10px; }
    .wk-split {
      font-size: 13px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
      background: rgba(34,197,94,0.1); color: var(--accent-green, #22c55e);
    }
    .wk-date { font-size: 12px; color: var(--text-tertiary, #9ca3af); }
    .wk-right { display: flex; align-items: center; gap: 12px; }
    .wk-duration { font-size: 12px; color: var(--text-secondary); }
    .wk-energy { display: flex; gap: 2px; }
    .energy-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-light, #e5e7eb);
      &.filled { background: var(--accent-green, #22c55e); }
    }
    .wk-exercises-summary { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wk-detail { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light, #e5e7eb); }
    .wk-exercise { margin-bottom: 8px; }
    .wk-ex-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .wk-sets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .wk-set {
      font-size: 12px; padding: 2px 8px; background: var(--bg-card-alt, #f3f4f6); border-radius: 4px;
      color: var(--text-primary); font-weight: 500;
      &.warmup { opacity: 0.5; }
    }
    .wk-cardio-detail { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .wk-notes { font-size: 12px; color: var(--text-secondary); font-style: italic; margin: 8px 0 0; }
    .btn-remove-workout {
      padding: 4px 10px; border: 1px solid #ef4444; border-radius: 4px;
      background: transparent; color: #ef4444; font-size: 12px; cursor: pointer; margin-top: 8px;
    }

    @media (max-width: 768px) {
      .charts-row { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr 1fr; }
      .stats-row { grid-template-columns: repeat(3, 1fr); }
      .set-row { grid-template-columns: 30px 60px 70px 40px 24px; }
    }
  `],
})
export class FitnessTrackerComponent implements OnInit {
  fitness = inject(HealthFitnessService);

  // UI State
  showLogForm = signal(false);
  showExerciseDropdown = signal(false);
  showAddCustom = signal(false);
  expandedWorkout = signal<string | null>(null);

  // Workout Form
  formDate = new Date().toISOString().split('T')[0];
  formSplit: WorkoutSplitType = 'push';
  formDuration = 60;
  formEnergy = 3;
  formNotes = '';
  exerciseSearch = '';
  pendingExercises: PendingExercise[] = [];

  // Custom Exercise
  customName = '';
  customMuscle: MuscleGroup = 'chest';
  customType: 'strength' | 'cardio' = 'strength';

  // Body Weight
  bwDate = new Date().toISOString().split('T')[0];
  bwWeight: number | null = null;

  // Charts
  bodyWeightChartOptions: EChartsOption | null = null;
  frequencyChartOptions: EChartsOption | null = null;
  volumeChartOptions: EChartsOption | null = null;
  progressChartOptions: EChartsOption | null = null;
  selectedExercise = '';

  splitTypes = [
    { value: 'push', label: 'Push' }, { value: 'pull', label: 'Pull' },
    { value: 'legs', label: 'Legs' }, { value: 'upper', label: 'Upper Body' },
    { value: 'lower', label: 'Lower Body' }, { value: 'full_body', label: 'Full Body' },
    { value: 'chest', label: 'Chest' }, { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' }, { value: 'arms', label: 'Arms' },
    { value: 'core', label: 'Core' }, { value: 'cardio', label: 'Cardio' },
    { value: 'custom', label: 'Custom' },
  ];

  filteredExercises = computed(() => {
    const q = this.exerciseSearch.toLowerCase();
    if (!q) return this.fitness.allExercises();
    return this.fitness.allExercises().filter(e => e.name.toLowerCase().includes(q));
  });

  groupedFilteredExercises = computed(() => {
    const grouped = new Map<string, ExerciseDefinition[]>();
    for (const ex of this.filteredExercises()) {
      const key = ex.muscleGroup;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(ex);
    }
    return Array.from(grouped.entries()).map(([key, exercises]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      exercises,
    }));
  });

  async ngOnInit() {
    await this.fitness.loadAll();
    this.buildCharts();

    // Close dropdown on outside click
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.exercise-search-wrapper')) {
        this.showExerciseDropdown.set(false);
      }
    });
  }

  // ─── Exercise Management ─────────────────────────────
  addExercise(ex: ExerciseDefinition) {
    this.pendingExercises.push({
      exercise: ex,
      sets: ex.type === 'strength' ? [{ setNumber: 1, reps: 10, weightKg: 0, isWarmup: false }] : [],
      distanceKm: null,
      durationMinutes: null,
      notes: '',
    });
    this.exerciseSearch = '';
    this.showExerciseDropdown.set(false);
  }

  removeExercise(index: number) {
    this.pendingExercises.splice(index, 1);
  }

  addSet(pe: PendingExercise) {
    const lastSet = pe.sets[pe.sets.length - 1];
    pe.sets.push({
      setNumber: pe.sets.length + 1,
      reps: lastSet?.reps || 10,
      weightKg: lastSet?.weightKg || 0,
      isWarmup: false,
    });
  }

  removeSet(pe: PendingExercise, index: number) {
    pe.sets.splice(index, 1);
    pe.sets.forEach((s, i) => s.setNumber = i + 1);
  }

  async saveCustomExercise() {
    if (!this.customName.trim()) return;
    await this.fitness.addCustomExercise({
      name: this.customName.trim(),
      muscleGroup: this.customMuscle,
      type: this.customType,
    });
    this.customName = '';
    this.showAddCustom.set(false);
  }

  // ─── Save Workout ────────────────────────────────────
  async saveWorkout() {
    if (this.pendingExercises.length === 0) return;

    await this.fitness.saveWorkout({
      workoutDate: this.formDate,
      splitType: this.formSplit,
      durationMinutes: this.formDuration,
      energyLevel: this.formEnergy,
      notes: this.formNotes || null,
      exercises: this.pendingExercises.map((pe, i) => ({
        id: '',
        sessionId: '',
        exerciseName: pe.exercise.name,
        muscleGroup: pe.exercise.muscleGroup,
        exerciseType: pe.exercise.type,
        sets: pe.sets,
        distanceKm: pe.distanceKm,
        durationMinutes: pe.durationMinutes,
        orderIndex: i,
        notes: pe.notes || null,
      })),
    });

    // Reset form
    this.pendingExercises = [];
    this.formNotes = '';
    this.formEnergy = 3;
    this.showLogForm.set(false);
    this.buildCharts();
  }

  // ─── Body Weight ─────────────────────────────────────
  async logWeight() {
    if (!this.bwWeight) return;
    await this.fitness.logBodyWeight(this.bwDate, this.bwWeight);
    this.bwWeight = null;
    this.buildCharts();
  }

  // ─── Workout History ─────────────────────────────────
  toggleExpand(id: string) {
    this.expandedWorkout.set(this.expandedWorkout() === id ? null : id);
  }

  async deleteWorkout(id: string, event: Event) {
    event.stopPropagation();
    await this.fitness.deleteWorkout(id);
    this.buildCharts();
  }

  getExerciseNames(w: WorkoutSession): string {
    return w.exercises.map(e => e.exerciseName).join(', ');
  }

  // ─── Charts ──────────────────────────────────────────
  buildCharts() {
    this.buildBodyWeightChart();
    this.buildFrequencyChart();
    this.buildVolumeChart();
  }

  private buildBodyWeightChart() {
    const data = this.fitness.getBodyWeightChartData(90);
    if (data.dates.length === 0) { this.bodyWeightChartOptions = null; return; }

    this.bodyWeightChartOptions = {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: { type: 'category', data: data.dates, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', min: (value: any) => Math.floor(value.min - 2), axisLabel: { formatter: '{value} kg' } },
      series: [{
        type: 'line', data: data.values, smooth: true,
        lineStyle: { color: '#22c55e', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(34,197,94,0.2)' }, { offset: 1, color: 'rgba(34,197,94,0.02)' }] } },
        itemStyle: { color: '#22c55e' },
      }],
    };
  }

  private buildFrequencyChart() {
    const data = this.fitness.getWorkoutFrequencyData(8);
    this.frequencyChartOptions = {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 30, left: 40 },
      xAxis: { type: 'category', data: data.labels, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        type: 'bar', data: data.values, barWidth: '50%',
        itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
      }],
    };
  }

  private buildVolumeChart() {
    const data = this.fitness.getMuscleGroupVolumeData();
    if (data.groups.length === 0) { this.volumeChartOptions = null; return; }

    this.volumeChartOptions = {
      tooltip: { trigger: 'axis' },
      grid: { top: 20, right: 20, bottom: 30, left: 60 },
      xAxis: { type: 'category', data: data.groups, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 't' : v + '' } },
      series: [{
        type: 'bar', data: data.volumes, barWidth: '50%',
        itemStyle: {
          color: (params: any) => {
            const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [4, 4, 0, 0],
        },
      }],
    };
  }

  updateProgressChart() {
    if (!this.selectedExercise) { this.progressChartOptions = null; return; }
    const data = this.fitness.getExerciseProgressData(this.selectedExercise);
    if (data.dates.length === 0) { this.progressChartOptions = null; return; }

    this.progressChartOptions = {
      tooltip: { trigger: 'axis', formatter: (params: any) => `${params[0].axisValue}<br/>${params[0].value} kg` },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: { type: 'category', data: data.dates, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} kg' } },
      series: [{
        type: 'line', data: data.values, smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } },
        itemStyle: { color: '#3b82f6' },
        markPoint: { data: [{ type: 'max', name: 'PR' }], symbol: 'pin', symbolSize: 40, itemStyle: { color: '#f59e0b' } },
      }],
    };
  }
}
