import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'raja-health-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-home">
      <div class="page-header">
        <h1>Health Dashboard</h1>
        <p class="subtitle">Your daily health cockpit</p>
      </div>

      <div class="score-card">
        <div class="score-ring">
          <svg viewBox="0 0 120 120" class="score-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light, #e5e7eb)" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent-green, #22c55e)" stroke-width="8"
              stroke-dasharray="326.73" [attr.stroke-dashoffset]="326.73 - (326.73 * healthScore / 100)"
              stroke-linecap="round" transform="rotate(-90 60 60)"/>
          </svg>
          <div class="score-value">
            <span class="score-number">{{ healthScore }}</span>
            <span class="score-label">Health Score</span>
          </div>
        </div>
      </div>

      <div class="vitals-grid">
        <div class="vital-card" *ngFor="let vital of todayVitals">
          <div class="vital-icon">{{ vital.icon }}</div>
          <div class="vital-info">
            <span class="vital-label">{{ vital.label }}</span>
            <span class="vital-value">{{ vital.value }} <small>{{ vital.unit }}</small></span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="/health/vault" class="action-card">
            <span class="action-icon">+</span>
            Upload Report
          </a>
          <a routerLink="/health/advisor" class="action-card">
            <span class="action-icon">AI</span>
            Ask Advisor
          </a>
          <a routerLink="/health/emergency" class="action-card">
            <span class="action-icon">!</span>
            Emergency Card
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .health-home {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary, #111827);
        margin: 0 0 4px 0;
      }

      .subtitle {
        color: var(--text-secondary, #6b7280);
        font-size: 14px;
        margin: 0;
      }
    }

    .score-card {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
    }

    .score-ring {
      position: relative;
      width: 160px;
      height: 160px;
    }

    .score-svg {
      width: 100%;
      height: 100%;
    }

    .score-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .score-number {
      display: block;
      font-size: 36px;
      font-weight: 700;
      color: var(--accent-green, #22c55e);
      line-height: 1;
    }

    .score-label {
      font-size: 11px;
      color: var(--text-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
      display: block;
    }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .vital-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 12px;
    }

    .vital-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-icon, #f3f4f6);
      border-radius: 10px;
      font-size: 18px;
    }

    .vital-info {
      display: flex;
      flex-direction: column;
    }

    .vital-label {
      font-size: 12px;
      color: var(--text-secondary, #6b7280);
    }

    .vital-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #111827);

      small {
        font-size: 12px;
        font-weight: 400;
        color: var(--text-secondary, #6b7280);
      }
    }

    .quick-actions {
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, #111827);
        margin: 0 0 12px 0;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #111827);
      text-decoration: none;
      cursor: pointer;
      transition: all 150ms;

      &:hover {
        border-color: var(--accent-green, #22c55e);
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
      }
    }

    .action-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(34, 197, 94, 0.1);
      color: var(--accent-green, #22c55e);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }
  `],
})
export class HealthHomeComponent {
  healthScore = 72;

  todayVitals = [
    { icon: '\u2764\ufe0f', label: 'Resting HR', value: '--', unit: 'bpm' },
    { icon: '\ud83d\udca4', label: 'Sleep', value: '--', unit: 'hrs' },
    { icon: '\ud83d\udeb6', label: 'Steps', value: '--', unit: '' },
    { icon: '\ud83e\ude78', label: 'SpO2', value: '--', unit: '%' },
    { icon: '\u26a1', label: 'HRV', value: '--', unit: 'ms' },
    { icon: '\u2696\ufe0f', label: 'Weight', value: '--', unit: 'kg' },
  ];
}
