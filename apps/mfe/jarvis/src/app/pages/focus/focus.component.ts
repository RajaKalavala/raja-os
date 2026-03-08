import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisService, JarvisMemoryService, FocusSession } from '@org/jarvis';

@Component({
  selector: 'raja-focus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="focus-page">
      @if (!activeSession()) {
        <!-- Setup -->
        <div class="focus-setup">
          <h2 class="setup-title">Start Focus Session</h2>

          <div class="form-group">
            <label class="form-label">What are you working on?</label>
            <input class="form-input" [(ngModel)]="taskDescription" placeholder="e.g. AI Terminal feature for Raja OS" />
          </div>

          <div class="form-group">
            <label class="form-label">Link to goal (optional)</label>
            <select class="form-input" [(ngModel)]="selectedGoalId">
              <option value="">No goal</option>
              @for (goal of goals(); track goal.id) {
                <option [value]="goal.id">{{ goal.title }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">How long?</label>
            <div class="duration-options">
              <button class="duration-btn" [class.active]="duration === 25" (click)="duration = 25">25 min</button>
              <button class="duration-btn" [class.active]="duration === 45" (click)="duration = 45">45 min</button>
              <button class="duration-btn" [class.active]="duration === 90" (click)="duration = 90">90 min</button>
              <input type="number" class="duration-custom" [(ngModel)]="duration" min="5" max="240" /> <span class="min-label">min</span>
            </div>
          </div>

          <button class="start-btn" (click)="startSession()" [disabled]="!taskDescription.trim()">
            START FOCUS SESSION
          </button>
        </div>
      } @else if (activeSession()!.status === 'active') {
        <!-- Active Session (Fullscreen-style) -->
        <div class="focus-active">
          <div class="focus-task-name">{{ activeSession()!.taskDescription }}</div>

          <div class="focus-timer">
            <div class="timer-display">{{ formatTime(remainingSeconds()) }}</div>
            <div class="timer-label">remaining</div>
          </div>

          <div class="focus-controls">
            <button class="control-btn pause" (click)="togglePause()">
              {{ isPaused() ? 'RESUME' : 'PAUSE' }}
            </button>
            <button class="control-btn end" (click)="endSession()">
              END SESSION
            </button>
          </div>

          <div class="focus-footer">
            Today's sessions: {{ todaySessions() }} | Total focus: {{ todayMinutes() }} min
          </div>
        </div>
      } @else {
        <!-- Post-Session Reflection -->
        <div class="focus-reflection">
          <h2 class="reflection-title">Session Complete!</h2>
          <p class="reflection-duration">{{ activeSession()!.plannedDurationMinutes }} minutes</p>

          <div class="form-group">
            <label class="form-label">What did you complete?</label>
            <textarea class="form-input" [(ngModel)]="completionNotes" rows="3" placeholder="Describe what you accomplished..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Any blockers or notes?</label>
            <textarea class="form-input" [(ngModel)]="blockers" rows="2" placeholder="Optional..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Rate your focus (1-5)</label>
            <div class="rating-options">
              @for (n of [1,2,3,4,5]; track n) {
                <button class="rating-btn" [class.active]="focusRating === n" (click)="focusRating = n">{{ n }}</button>
              }
            </div>
          </div>

          <button class="start-btn" (click)="saveSession()">
            SAVE SESSION
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .focus-page {
      max-width: 600px;
      margin: 0 auto;
    }

    .focus-setup, .focus-reflection {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      padding: 32px;
    }

    .setup-title, .reflection-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--jarvis-text, #e5e7eb);
      margin: 0 0 24px;
    }

    .reflection-duration {
      font-size: 16px;
      color: var(--jarvis-primary, #10b981);
      margin: -16px 0 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--jarvis-text-muted, #6b7280);
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 8px;
      color: var(--jarvis-text, #e5e7eb);
      font-size: 14px;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      outline: none;
      box-sizing: border-box;

      &:focus { border-color: var(--jarvis-primary, #10b981); }
      &::placeholder { color: var(--jarvis-text-muted, #6b7280); }
    }

    select.form-input {
      appearance: none;
      cursor: pointer;
    }

    .duration-options {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .duration-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      background: transparent;
      color: var(--jarvis-text-muted, #6b7280);
      font-size: 13px;
      cursor: pointer;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      transition: all 150ms;

      &:hover { border-color: var(--jarvis-primary, #10b981); color: var(--jarvis-text, #e5e7eb); }
      &.active { background: rgba(16, 185, 129, 0.15); border-color: var(--jarvis-primary, #10b981); color: var(--jarvis-primary, #10b981); }
    }

    .duration-custom {
      width: 60px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 6px;
      color: var(--jarvis-text, #e5e7eb);
      font-size: 13px;
      text-align: center;
      outline: none;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
    }

    .min-label {
      font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
    }

    .start-btn {
      width: 100%;
      padding: 14px;
      background: var(--jarvis-primary, #10b981);
      color: #000;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.05em;
      cursor: pointer;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      transition: all 150ms;
      margin-top: 8px;

      &:hover:not(:disabled) { background: #059669; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .rating-options {
      display: flex;
      gap: 8px;
    }

    .rating-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      background: transparent;
      color: var(--jarvis-text-muted, #6b7280);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;

      &.active {
        background: rgba(16, 185, 129, 0.2);
        border-color: var(--jarvis-primary, #10b981);
        color: var(--jarvis-primary, #10b981);
      }
    }

    /* Active Focus Mode */
    .focus-active {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .focus-task-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--jarvis-text, #e5e7eb);
      margin-bottom: 40px;
      padding: 12px 24px;
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 8px;
    }

    .focus-timer {
      margin-bottom: 40px;
    }

    .timer-display {
      font-size: 72px;
      font-weight: 800;
      color: var(--jarvis-primary, #10b981);
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
    }

    .timer-label {
      font-size: 14px;
      color: var(--jarvis-text-muted, #6b7280);
      margin-top: 4px;
    }

    .focus-controls {
      display: flex;
      gap: 16px;
    }

    .control-btn {
      padding: 12px 32px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.05em;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      transition: all 150ms;
    }

    .control-btn.pause {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;

      &:hover { background: rgba(251, 191, 36, 0.25); }
    }

    .control-btn.end {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;

      &:hover { background: rgba(239, 68, 68, 0.25); }
    }

    .focus-footer {
      margin-top: 40px;
      font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
    }
  `],
})
export class FocusComponent implements OnDestroy {
  private jarvisService = inject(JarvisService);
  private memoryService = inject(JarvisMemoryService);

  // Setup state
  taskDescription = '';
  selectedGoalId = '';
  duration = 25;
  goals = signal<{ id: string; title: string }[]>([]);

  // Active session
  activeSession = signal<FocusSession | null>(null);
  remainingSeconds = signal(0);
  isPaused = signal(false);
  todaySessions = signal(0);
  todayMinutes = signal(0);

  // Reflection
  completionNotes = '';
  blockers = '';
  focusRating = 0;

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  async ngOnInit() {
    const goalsList = await this.memoryService.getActiveGoals();
    this.goals.set(goalsList);
    const stats = await this.memoryService.getTodayFocusStats();
    this.todaySessions.set(stats.sessions);
    this.todayMinutes.set(stats.minutes);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  async startSession() {
    if (!this.taskDescription.trim()) return;

    const session: FocusSession = {
      id: crypto.randomUUID(),
      userId: '',
      taskDescription: this.taskDescription.trim(),
      goalId: this.selectedGoalId || null,
      plannedDurationMinutes: this.duration,
      actualDurationMinutes: null,
      status: 'active',
      completionNotes: null,
      blockers: null,
      focusRating: null,
      startedAt: new Date(),
      endedAt: null,
    };

    await this.jarvisService.startFocusSession(session);
    this.activeSession.set(session);
    this.remainingSeconds.set(this.duration * 60);
    this.startTimer();
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (!this.isPaused()) {
        const remaining = this.remainingSeconds() - 1;
        if (remaining <= 0) {
          this.remainingSeconds.set(0);
          this.endSession();
        } else {
          this.remainingSeconds.set(remaining);
        }
      }
    }, 1000);
  }

  togglePause() {
    this.isPaused.update(p => !p);
  }

  endSession() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const session = this.activeSession();
    if (session) {
      const elapsed = Math.round((this.duration * 60 - this.remainingSeconds()) / 60);
      this.activeSession.set({
        ...session,
        status: 'completed',
        actualDurationMinutes: elapsed,
        endedAt: new Date(),
      });
    }
  }

  async saveSession() {
    const session = this.activeSession();
    if (!session) return;

    await this.jarvisService.saveFocusSession({
      ...session,
      completionNotes: this.completionNotes || null,
      blockers: this.blockers || null,
      focusRating: this.focusRating || null,
    });

    // Reset
    this.activeSession.set(null);
    this.taskDescription = '';
    this.selectedGoalId = '';
    this.completionNotes = '';
    this.blockers = '';
    this.focusRating = 0;

    const stats = await this.memoryService.getTodayFocusStats();
    this.todaySessions.set(stats.sessions);
    this.todayMinutes.set(stats.minutes);
  }

  formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
