import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JarvisService, WeeklyReview } from '@org/jarvis';

@Component({
  selector: 'raja-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="review-page">
      @if (isLoading()) {
        <div class="loading">
          <span class="prompt">&gt;</span> Generating your weekly review...
          <span class="cursor">_</span>
        </div>
      } @else if (review()) {
        <div class="review-terminal">
          <div class="terminal-header">
            <div class="terminal-dots">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            </div>
            <span class="terminal-title">WEEKLY REVIEW — Week {{ getWeekNumber() }}, {{ getYear() }}</span>
          </div>
          <div class="terminal-body">
            <div class="review-section">
              <div class="section-label">WHAT I SHIPPED</div>
              <div class="section-content">{{ review()!.shipped || 'Nothing recorded this week.' }}</div>
            </div>

            <div class="review-section">
              <div class="section-label">WINS</div>
              <div class="section-content wins">{{ review()!.wins || 'No wins recorded.' }}</div>
            </div>

            <div class="review-section">
              <div class="section-label">MISSED / BEHIND</div>
              <div class="section-content missed">{{ review()!.missed || 'Nothing missed.' }}</div>
            </div>

            <div class="review-section">
              <div class="section-label">CHALLENGES</div>
              <div class="section-content">{{ review()!.challenges || 'No challenges noted.' }}</div>
            </div>

            @if (review()!.aiReflection) {
              <div class="review-section">
                <div class="section-label">JARVIS REFLECTION</div>
                <div class="section-content reflection">{{ review()!.aiReflection }}</div>
              </div>
            }

            <div class="review-actions">
              @if (review()!.linkedinDraft) {
                <button class="review-btn primary" (click)="copyLinkedInDraft()">
                  Copy LinkedIn Post
                </button>
              }
              <button class="review-btn secondary" (click)="saveReview()">Save Review</button>
              <button class="review-btn secondary" (click)="regenerate()">Regenerate</button>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <h3>Weekly Review</h3>
          <p>Jarvis will analyze your past week and generate a comprehensive review.</p>
          <button class="generate-btn" (click)="generateReview()">Generate Weekly Review</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .review-page { max-width: 800px; margin: 0 auto; }

    .review-terminal {
      background: #0a0a0a;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px; overflow: hidden;
    }

    .terminal-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; background: #151515;
      border-bottom: 1px solid var(--jarvis-border, #1f1f1f);
    }
    .terminal-dots { display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #ef4444; } .dot.yellow { background: #fbbf24; } .dot.green { background: #10b981; }
    .terminal-title { font-size: 12px; font-weight: 600; color: var(--jarvis-text-muted, #6b7280); letter-spacing: 0.1em; }

    .terminal-body {
      padding: 24px;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
    }

    .review-section {
      margin-bottom: 20px; padding: 14px;
      border-left: 2px solid var(--jarvis-border, #1f1f1f);
      border-radius: 0 8px 8px 0;
    }

    .section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
      color: var(--jarvis-text-muted, #6b7280); margin-bottom: 8px;
    }

    .section-content {
      font-size: 14px; line-height: 1.7; color: var(--jarvis-text, #e5e7eb);
      white-space: pre-wrap;
    }

    .wins { border-left-color: #10b981; }
    .missed { border-left-color: #ef4444; }
    .reflection { border-left-color: #6366f1; font-style: italic; color: #a5b4fc; }

    .review-actions {
      display: flex; gap: 12px; margin-top: 24px; padding-top: 20px;
      border-top: 1px solid var(--jarvis-border, #1f1f1f);
    }

    .review-btn {
      padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 150ms; border: none;
      font-family: var(--jarvis-font, monospace);
    }
    .review-btn.primary { background: var(--jarvis-primary, #10b981); color: #000; }
    .review-btn.primary:hover { background: #059669; }
    .review-btn.secondary {
      background: transparent; color: var(--jarvis-text-muted, #6b7280);
      border: 1px solid var(--jarvis-border, #1f1f1f);
    }
    .review-btn.secondary:hover { border-color: var(--jarvis-text-muted); color: var(--jarvis-text, #e5e7eb); }

    .loading {
      text-align: center; padding: 60px; font-size: 15px;
      color: var(--jarvis-text-muted, #6b7280);
      font-family: var(--jarvis-font, monospace);
    }
    .prompt { color: var(--jarvis-primary, #10b981); font-weight: 700; }
    .cursor { animation: blink 1s step-end infinite; color: var(--jarvis-primary, #10b981); }
    @keyframes blink { 50% { opacity: 0; } }

    .empty-state {
      text-align: center; padding: 60px 20px;
      h3 { font-size: 20px; color: var(--jarvis-text, #e5e7eb); margin: 0 0 8px; }
      p { font-size: 14px; color: var(--jarvis-text-muted, #6b7280); margin: 0 0 24px; }
    }

    .generate-btn {
      padding: 12px 24px; border-radius: 8px; background: var(--jarvis-primary, #10b981);
      color: #000; border: none; font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: var(--jarvis-font, monospace);
    }
  `],
})
export class ReviewComponent implements OnInit {
  private jarvisService = inject(JarvisService);

  review = signal<WeeklyReview | null>(null);
  isLoading = signal(false);

  async ngOnInit() {
    const existing = await this.jarvisService.getLatestReview();
    if (existing) this.review.set(existing);
  }

  getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  }

  getYear(): number { return new Date().getFullYear(); }

  async generateReview() {
    this.isLoading.set(true);
    try {
      const result = await this.jarvisService.generateWeeklyReview();
      this.review.set(result);
    } catch { /* handle */ }
    this.isLoading.set(false);
  }

  async regenerate() { await this.generateReview(); }

  async saveReview() {
    const r = this.review();
    if (r) await this.jarvisService.saveWeeklyReview(r);
  }

  copyLinkedInDraft() {
    const draft = this.review()?.linkedinDraft;
    if (draft) navigator.clipboard.writeText(draft);
  }
}
