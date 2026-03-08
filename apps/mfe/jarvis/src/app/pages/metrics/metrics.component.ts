import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JarvisService, LifeMetrics } from '@org/jarvis';

@Component({
  selector: 'raja-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-page">
      <div class="metrics-header">
        <h2>LIFE OS</h2>
        <span class="week-label">Week {{ metrics()?.weekNumber || '—' }}, {{ metrics()?.year || '—' }}</span>
      </div>

      @if (isLoading()) {
        <div class="loading">Calculating scores...</div>
      } @else if (metrics()) {
        <div class="scores-grid">
          @for (item of scoreItems(); track item.label) {
            <div class="score-card">
              <div class="score-header">
                <span class="score-label">{{ item.label }}</span>
                <span class="score-trend" [class]="item.trendClass">{{ item.trend }}</span>
              </div>
              <div class="score-bar-wrapper">
                <div class="score-bar" [style.width.%]="item.value" [style.background]="item.color"></div>
              </div>
              <div class="score-footer">
                <span class="score-value">{{ item.value | number:'1.0-0' }}%</span>
                <span class="score-note" [style.color]="item.noteColor">{{ item.note }}</span>
              </div>
            </div>
          }
        </div>

        <div class="overall-score">
          <div class="overall-label">RAJA OS SCORE</div>
          <div class="overall-value">{{ metrics()!.overall | number:'1.0-0' }}<span class="overall-max">/100</span></div>
        </div>

        <div class="actions">
          <button class="action-btn" (click)="recalculate()">Recalculate Scores</button>
          <button class="action-btn" (click)="saveSnapshot()">Save Weekly Snapshot</button>
        </div>
      } @else {
        <div class="empty-state">
          <p>No metrics data yet. Start tracking habits and completing tasks to see your scores.</p>
          <button class="calculate-btn" (click)="recalculate()">Calculate My Scores</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .metrics-page { max-width: 800px; margin: 0 auto; }

    .metrics-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px;
      h2 { font-size: 24px; font-weight: 800; letter-spacing: 0.1em; color: var(--jarvis-primary, #10b981); margin: 0; }
    }

    .week-label { font-size: 14px; color: var(--jarvis-text-muted, #6b7280); }

    .scores-grid { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }

    .score-card {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 10px; padding: 16px 20px;
    }

    .score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .score-label { font-size: 14px; font-weight: 700; color: var(--jarvis-text, #e5e7eb); letter-spacing: 0.05em; }
    .score-trend { font-size: 12px; font-weight: 600; }
    .score-trend.up { color: #10b981; }
    .score-trend.down { color: #ef4444; }
    .score-trend.flat { color: #6b7280; }

    .score-bar-wrapper {
      height: 8px; background: rgba(255,255,255,0.05);
      border-radius: 4px; overflow: hidden; margin-bottom: 8px;
    }
    .score-bar { height: 100%; border-radius: 4px; transition: width 600ms ease; }

    .score-footer { display: flex; justify-content: space-between; align-items: center; }
    .score-value { font-size: 20px; font-weight: 800; color: var(--jarvis-text, #e5e7eb); }
    .score-note { font-size: 12px; }

    .overall-score {
      text-align: center; padding: 32px;
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-primary, #10b981);
      border-radius: 12px; margin-bottom: 24px;
    }
    .overall-label { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; color: var(--jarvis-text-muted, #6b7280); margin-bottom: 8px; }
    .overall-value { font-size: 56px; font-weight: 800; color: var(--jarvis-primary, #10b981); }
    .overall-max { font-size: 24px; color: var(--jarvis-text-muted, #6b7280); }

    .actions { display: flex; gap: 12px; justify-content: center; }

    .action-btn, .calculate-btn {
      padding: 10px 20px; border-radius: 8px; border: 1px solid var(--jarvis-border, #1f1f1f);
      background: transparent; color: var(--jarvis-text-muted, #6b7280);
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: var(--jarvis-font, monospace); transition: all 150ms;
      &:hover { border-color: var(--jarvis-primary, #10b981); color: var(--jarvis-text, #e5e7eb); }
    }

    .calculate-btn {
      background: var(--jarvis-primary, #10b981); color: #000;
      border: none; padding: 12px 24px; font-size: 14px;
    }

    .loading, .empty-state {
      text-align: center; padding: 60px 20px;
      color: var(--jarvis-text-muted, #6b7280); font-size: 15px;
    }
  `],
})
export class MetricsComponent implements OnInit {
  private jarvisService = inject(JarvisService);

  metrics = signal<LifeMetrics | null>(null);
  isLoading = signal(false);

  scoreItems = signal<Array<{
    label: string; value: number; color: string;
    trend: string; trendClass: string;
    note: string; noteColor: string;
  }>>([]);

  async ngOnInit() {
    await this.loadMetrics();
  }

  async loadMetrics() {
    this.isLoading.set(true);
    try {
      const m = await this.jarvisService.calculateMetrics();
      this.metrics.set(m);
      this.buildScoreItems(m);
    } catch {
      // No data
    }
    this.isLoading.set(false);
  }

  private buildScoreItems(m: LifeMetrics) {
    const prev = m.previousWeek;
    const items = [
      { label: 'WORK', value: m.work, color: '#3b82f6' },
      { label: 'HEALTH', value: m.health, color: '#ef4444' },
      { label: 'LEARNING', value: m.learning, color: '#8b5cf6' },
      { label: 'SIDE PROJECT', value: m.sideProject, color: '#f59e0b' },
      { label: 'FINANCE', value: m.finance, color: '#10b981' },
      { label: 'PERSONAL BRAND', value: m.brand, color: '#ec4899' },
    ].map(item => {
      const prevVal = prev ? (prev as unknown as Record<string, number>)[item.label.toLowerCase().replace(' ', '')] || 0 : 0;
      const diff = item.value - prevVal;
      return {
        ...item,
        trend: diff > 0 ? `+${diff.toFixed(0)}%` : diff < 0 ? `${diff.toFixed(0)}%` : '—',
        trendClass: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
        note: item.value >= 70 ? 'On track' : item.value >= 40 ? 'Needs attention' : 'Critical',
        noteColor: item.value >= 70 ? '#10b981' : item.value >= 40 ? '#f59e0b' : '#ef4444',
      };
    });
    this.scoreItems.set(items);
  }

  async recalculate() {
    await this.loadMetrics();
  }

  async saveSnapshot() {
    const m = this.metrics();
    if (m) {
      await this.jarvisService.saveMetricsSnapshot(m);
    }
  }
}
