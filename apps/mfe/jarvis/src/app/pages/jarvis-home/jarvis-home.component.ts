import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JarvisMemoryService } from '@org/jarvis';
import { SupabaseService } from '@org/supabase';

@Component({
  selector: 'raja-jarvis-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="jarvis-home">
      <div class="jarvis-header">
        <div class="jarvis-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
          </svg>
        </div>
        <div class="jarvis-title-block">
          <h1 class="jarvis-title">JARVIS</h1>
          <p class="jarvis-subtitle">Personal AI Operating System</p>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/jarvis/briefing" class="action-card">
          <div class="action-icon briefing-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            </svg>
          </div>
          <span class="action-label">Morning Briefing</span>
          <span class="action-desc">Your daily command center</span>
        </a>
        <a routerLink="/jarvis/chat" class="action-card">
          <div class="action-icon chat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <span class="action-label">Chat with Jarvis</span>
          <span class="action-desc">Ask anything about your life</span>
        </a>
        <a routerLink="/jarvis/focus" class="action-card">
          <div class="action-icon focus-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span class="action-label">Focus Session</span>
          <span class="action-desc">Deep work timer</span>
        </a>
        <a routerLink="/jarvis/capture" class="action-card">
          <div class="action-icon capture-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <span class="action-label">Quick Capture</span>
          <span class="action-desc">Brain dump anything</span>
        </a>
        <a routerLink="/jarvis/metrics" class="action-card">
          <div class="action-icon metrics-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <span class="action-label">Life Metrics</span>
          <span class="action-desc">Your life dashboard</span>
        </a>
        <a routerLink="/jarvis/review" class="action-card">
          <div class="action-icon review-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <span class="action-label">Weekly Review</span>
          <span class="action-desc">Reflect and plan ahead</span>
        </a>
      </div>

      <div class="quick-stats">
        <h3 class="stats-title">QUICK STATS</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ memoryCount() }}</span>
            <span class="stat-label">Memories stored</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ focusSessionsThisWeek() }}</span>
            <span class="stat-label">Focus sessions this week</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ bestStreak() }} days</span>
            <span class="stat-label">Best habit streak</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ overallScore() }}/100</span>
            <span class="stat-label">Overall score this week</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jarvis-home {
      max-width: 900px;
      margin: 0 auto;
    }

    .jarvis-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
    }

    .jarvis-logo {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .jarvis-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--jarvis-primary, #10b981);
      margin: 0;
    }

    .jarvis-subtitle {
      font-size: 14px;
      color: var(--jarvis-text-muted, #6b7280);
      margin: 2px 0 0;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      text-decoration: none;
      color: var(--jarvis-text, #e5e7eb);
      transition: all 200ms;
      cursor: pointer;

      &:hover {
        border-color: var(--jarvis-primary, #10b981);
        transform: translateY(-2px);
      }
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .briefing-icon { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
    .chat-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .focus-icon { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
    .capture-icon { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
    .metrics-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .review-icon { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

    .action-label {
      font-size: 15px;
      font-weight: 600;
    }

    .action-desc {
      font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
    }

    .quick-stats {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      padding: 24px;
    }

    .stats-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--jarvis-text-muted, #6b7280);
      margin: 0 0 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--jarvis-primary, #10b981);
    }

    .stat-label {
      font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
    }

    @media (max-width: 768px) {
      .quick-actions {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class JarvisHomeComponent implements OnInit {
  private memoryService = inject(JarvisMemoryService);

  memoryCount = signal(0);
  focusSessionsThisWeek = signal(0);
  bestStreak = signal(0);
  overallScore = signal(0);

  async ngOnInit() {
    await this.loadStats();
  }

  private async loadStats() {
    try {
      const count = await this.memoryService.getMemoryCount();
      this.memoryCount.set(count);
      const focusCount = await this.memoryService.getFocusSessionsThisWeek();
      this.focusSessionsThisWeek.set(focusCount);
    } catch {
      // Stats will show 0 if no data yet
    }
  }
}
