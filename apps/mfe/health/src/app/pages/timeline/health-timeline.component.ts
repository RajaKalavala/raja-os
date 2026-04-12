import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'raja-health-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-page">
      <div class="page-header">
        <h1>Health Timeline</h1>
        <p class="subtitle">Chronological view of all health events</p>
      </div>
      <div class="placeholder-card">
        <p>See a timeline of reports, lab results, medication changes, and AI insights.</p>
        <p class="hint">Phase 2 — Chronological event feed + calendar heatmap</p>
      </div>
    </div>
  `,
  styles: [`
    .timeline-page { max-width: 1200px; margin: 0 auto; }
    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); margin: 0 0 4px 0; }
      .subtitle { color: var(--text-secondary, #6b7280); font-size: 14px; margin: 0; }
    }
    .placeholder-card {
      padding: 48px 32px;
      text-align: center;
      background: var(--bg-card, #ffffff);
      border: 1px dashed var(--border-primary, #e5e7eb);
      border-radius: 12px;
      color: var(--text-secondary, #6b7280);
      p { margin: 0 0 8px 0; }
      .hint { font-size: 12px; opacity: 0.6; }
    }
  `],
})
export class HealthTimelineComponent {}
