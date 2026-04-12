import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'raja-correlations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="correlations-page">
      <div class="page-header">
        <h1>Correlations</h1>
        <p class="subtitle">AI-powered pattern discovery across your health data</p>
      </div>
      <div class="placeholder-card">
        <p>Find patterns between your habits and health metrics.</p>
        <p class="hint">Phase 3 — Scatter plots + AI correlation engine</p>
      </div>
    </div>
  `,
  styles: [`
    .correlations-page { max-width: 1200px; margin: 0 auto; }
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
export class CorrelationsComponent {}
