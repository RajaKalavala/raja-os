import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JarvisService, JarvisMemoryService, JarvisBriefing } from '@org/jarvis';
import { SupabaseService } from '@org/supabase';

@Component({
  selector: 'raja-briefing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="briefing-page">
      <div class="briefing-terminal">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="terminal-title">JARVIS MORNING BRIEFING</span>
        </div>

        @if (isLoading()) {
          <div class="terminal-body">
            <div class="loading-line">
              <span class="prompt">&gt;</span> Loading your day...
              <span class="cursor">_</span>
            </div>
          </div>
        } @else if (briefing()) {
          <div class="terminal-body">
            <div class="briefing-greeting">
              <span class="prompt">&gt;</span> Good {{ getTimeOfDay() }}, Raja
              <span class="date-line">{{ today | date:'EEEE, MMMM d' }} | {{ today | date:'h:mm a' }}</span>
            </div>

            <div class="briefing-section">
              <div class="section-label">TODAY'S #1 PRIORITY</div>
              <div class="section-content priority-content">
                <span class="arrow">→</span> {{ briefing()!.topPriority || 'No priorities set for today' }}
              </div>
            </div>

            @if (briefing()!.aiInsight) {
              <div class="briefing-section">
                <div class="section-label">JARVIS INSIGHT</div>
                <div class="section-content insight-content">
                  <span class="arrow">→</span> {{ briefing()!.aiInsight }}
                </div>
              </div>
            }

            <div class="briefing-actions">
              <button class="briefing-btn primary" (click)="startDay()">
                Start My Day →
              </button>
              <button class="briefing-btn secondary" (click)="regenerate()">
                Regenerate
              </button>
            </div>
          </div>
        } @else {
          <div class="terminal-body">
            <div class="empty-state">
              <span class="prompt">&gt;</span> No briefing generated yet for today.
              <button class="briefing-btn primary" (click)="generateBriefing()">
                Generate Morning Briefing
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .briefing-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .briefing-terminal {
      background: #0a0a0a;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      overflow: hidden;
    }

    .terminal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #151515;
      border-bottom: 1px solid var(--jarvis-border, #1f1f1f);
    }

    .terminal-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #fbbf24; }
    .dot.green { background: #10b981; }

    .terminal-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--jarvis-text-muted, #6b7280);
      letter-spacing: 0.1em;
    }

    .terminal-body {
      padding: 24px;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      line-height: 1.8;
    }

    .briefing-greeting {
      font-size: 18px;
      font-weight: 600;
      color: var(--jarvis-primary, #10b981);
      margin-bottom: 24px;
    }

    .date-line {
      display: block;
      font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
      font-weight: 400;
      margin-top: 4px;
    }

    .prompt {
      color: var(--jarvis-primary, #10b981);
      font-weight: 700;
    }

    .briefing-section {
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border-left: 2px solid var(--jarvis-primary, #10b981);
      border-radius: 0 8px 8px 0;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--jarvis-text-muted, #6b7280);
      margin-bottom: 8px;
    }

    .section-content {
      font-size: 15px;
      color: var(--jarvis-text, #e5e7eb);
    }

    .arrow {
      color: var(--jarvis-primary, #10b981);
      margin-right: 8px;
    }

    .priority-content {
      color: #fbbf24;
      font-weight: 600;
    }

    .insight-content {
      font-style: italic;
      color: #a5b4fc;
    }

    .loading-line {
      font-size: 15px;
      color: var(--jarvis-text-muted, #6b7280);
    }

    .cursor {
      animation: blink 1s step-end infinite;
      color: var(--jarvis-primary, #10b981);
    }

    @keyframes blink {
      50% { opacity: 0; }
    }

    .briefing-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--jarvis-border, #1f1f1f);
    }

    .briefing-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
      border: none;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
    }

    .briefing-btn.primary {
      background: var(--jarvis-primary, #10b981);
      color: #000;
    }

    .briefing-btn.primary:hover {
      background: #059669;
    }

    .briefing-btn.secondary {
      background: transparent;
      color: var(--jarvis-text-muted, #6b7280);
      border: 1px solid var(--jarvis-border, #1f1f1f);
    }

    .briefing-btn.secondary:hover {
      border-color: var(--jarvis-text-muted, #6b7280);
      color: var(--jarvis-text, #e5e7eb);
    }

    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: var(--jarvis-text-muted, #6b7280);

      .briefing-btn {
        margin-top: 20px;
      }
    }
  `],
})
export class BriefingComponent implements OnInit {
  private jarvisService = inject(JarvisService);
  private memoryService = inject(JarvisMemoryService);

  briefing = signal<JarvisBriefing | null>(null);
  isLoading = signal(false);
  today = new Date();

  async ngOnInit() {
    await this.loadTodaysBriefing();
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  async loadTodaysBriefing() {
    this.isLoading.set(true);
    try {
      const existing = await this.jarvisService.getTodaysBriefing();
      if (existing) {
        this.briefing.set(existing);
      }
    } catch {
      // No briefing yet
    }
    this.isLoading.set(false);
  }

  async generateBriefing() {
    this.isLoading.set(true);
    try {
      const result = await this.jarvisService.generateBriefing();
      this.briefing.set(result);
    } catch {
      // Handle error
    }
    this.isLoading.set(false);
  }

  async regenerate() {
    await this.generateBriefing();
  }

  startDay() {
    // Navigate to top priority or planner
    window.location.hash = '/planner';
  }
}
