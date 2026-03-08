import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisService, JarvisCapture } from '@org/jarvis';

@Component({
  selector: 'raja-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="capture-page">
      <!-- Capture Input -->
      <div class="capture-box">
        <div class="capture-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>JARVIS CAPTURE</span>
        </div>
        <div class="capture-body">
          <label class="capture-label">What's on your mind?</label>
          <textarea
            class="capture-input"
            [(ngModel)]="rawInput"
            (keydown)="onKeydown($event)"
            placeholder="Type anything — idea, task, note, reminder..."
            rows="4"
          ></textarea>
          <button class="capture-btn" (click)="capture()" [disabled]="!rawInput.trim() || isProcessing()">
            {{ isProcessing() ? 'Processing...' : 'CAPTURE IT' }}
          </button>
        </div>
      </div>

      <!-- Latest Classification Result -->
      @if (lastResult()) {
        <div class="classification-result">
          <div class="result-header">
            <span class="result-type">{{ lastResult()!.classifiedType?.toUpperCase() || 'PROCESSING' }}</span>
            @if (lastResult()!.classifiedCategory) {
              <span class="result-category">{{ lastResult()!.classifiedCategory }}</span>
            }
          </div>
          @if (lastResult()!.aiSummary) {
            <p class="result-summary">{{ lastResult()!.aiSummary }}</p>
          }
          <div class="result-status">
            @if (lastResult()!.status === 'routed') {
              <span class="status-badge routed">Routed to {{ lastResult()!.routedTo }}</span>
            } @else {
              <span class="status-badge pending">Pending</span>
              <button class="route-btn" (click)="routeCapture(lastResult()!)">Route it</button>
              <button class="dismiss-btn" (click)="dismissCapture(lastResult()!.id)">Dismiss</button>
            }
          </div>
        </div>
      }

      <!-- Capture History -->
      <div class="capture-history">
        <div class="history-header">
          <h3>Recent Captures</h3>
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="filterStatus() === 'all'" (click)="filterStatus.set('all')">All</button>
            <button class="filter-tab" [class.active]="filterStatus() === 'pending'" (click)="filterStatus.set('pending')">Pending</button>
            <button class="filter-tab" [class.active]="filterStatus() === 'routed'" (click)="filterStatus.set('routed')">Routed</button>
          </div>
        </div>
        <div class="capture-list">
          @for (cap of filteredCaptures(); track cap.id) {
            <div class="capture-item">
              <div class="capture-item-content">
                <span class="capture-item-type">{{ cap.classifiedType || '?' }}</span>
                <span class="capture-item-text">{{ cap.rawInput }}</span>
              </div>
              <span class="capture-item-status" [class]="cap.status">{{ cap.status }}</span>
            </div>
          } @empty {
            <div class="empty-list">No captures yet. Start dumping your thoughts above.</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .capture-page { max-width: 700px; margin: 0 auto; }

    .capture-box {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .capture-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px;
      background: #151515;
      border-bottom: 1px solid var(--jarvis-border, #1f1f1f);
      font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--jarvis-primary, #10b981);
    }

    .capture-body { padding: 20px; }

    .capture-label {
      display: block; font-size: 14px;
      color: var(--jarvis-text-muted, #6b7280);
      margin-bottom: 12px;
    }

    .capture-input {
      width: 100%; padding: 12px 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 8px;
      color: var(--jarvis-text, #e5e7eb);
      font-size: 14px; font-family: var(--jarvis-font, monospace);
      resize: vertical; outline: none; box-sizing: border-box;
      &:focus { border-color: var(--jarvis-primary, #10b981); }
      &::placeholder { color: var(--jarvis-text-muted, #6b7280); }
    }

    .capture-btn {
      width: 100%; margin-top: 12px; padding: 12px;
      background: var(--jarvis-primary, #10b981); color: #000;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
      letter-spacing: 0.05em; cursor: pointer;
      font-family: var(--jarvis-font, monospace); transition: all 150ms;
      &:hover:not(:disabled) { background: #059669; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .classification-result {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-primary, #10b981);
      border-radius: 12px; padding: 20px; margin-bottom: 24px;
    }

    .result-header { display: flex; gap: 8px; margin-bottom: 8px; }

    .result-type {
      padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;
      background: rgba(16,185,129,0.15); color: var(--jarvis-primary, #10b981);
      letter-spacing: 0.05em;
    }

    .result-category {
      padding: 4px 10px; border-radius: 4px; font-size: 12px;
      background: rgba(99,102,241,0.15); color: #6366f1;
    }

    .result-summary { font-size: 14px; color: var(--jarvis-text, #e5e7eb); margin: 8px 0; }

    .result-status { display: flex; gap: 8px; align-items: center; margin-top: 12px; }

    .status-badge {
      padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;
      &.routed { background: rgba(16,185,129,0.15); color: #10b981; }
      &.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
    }

    .route-btn, .dismiss-btn {
      padding: 6px 12px; border-radius: 6px; border: none;
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: var(--jarvis-font, monospace); transition: all 150ms;
    }
    .route-btn { background: rgba(16,185,129,0.15); color: #10b981; }
    .dismiss-btn { background: rgba(239,68,68,0.1); color: #ef4444; }

    .capture-history {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px; padding: 20px;
    }

    .history-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
      h3 { margin: 0; font-size: 15px; color: var(--jarvis-text, #e5e7eb); }
    }

    .filter-tabs { display: flex; gap: 4px; }

    .filter-tab {
      padding: 6px 12px; border-radius: 6px; border: none;
      background: transparent; color: var(--jarvis-text-muted, #6b7280);
      font-size: 12px; cursor: pointer;
      font-family: var(--jarvis-font, monospace); transition: all 150ms;
      &.active { background: rgba(16,185,129,0.15); color: var(--jarvis-primary, #10b981); }
    }

    .capture-list { display: flex; flex-direction: column; gap: 8px; }

    .capture-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 6px;
    }

    .capture-item-content { display: flex; gap: 8px; align-items: center; flex: 1; min-width: 0; }

    .capture-item-type {
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      padding: 2px 6px; border-radius: 3px;
      background: rgba(255,255,255,0.05); color: var(--jarvis-text-muted, #6b7280);
      text-transform: uppercase; flex-shrink: 0;
    }

    .capture-item-text {
      font-size: 13px; color: var(--jarvis-text, #e5e7eb);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .capture-item-status {
      font-size: 11px; font-weight: 600; flex-shrink: 0;
      &.pending { color: #fbbf24; }
      &.routed { color: #10b981; }
      &.dismissed { color: var(--jarvis-text-muted, #6b7280); }
    }

    .empty-list {
      text-align: center; padding: 24px; font-size: 13px;
      color: var(--jarvis-text-muted, #6b7280);
    }
  `],
})
export class CaptureComponent {
  private jarvisService = inject(JarvisService);

  rawInput = '';
  isProcessing = signal(false);
  lastResult = signal<JarvisCapture | null>(null);
  captures = signal<JarvisCapture[]>([]);
  filterStatus = signal<'all' | 'pending' | 'routed'>('all');

  filteredCaptures = computed(() => {
    const status = this.filterStatus();
    const all = this.captures();
    if (status === 'all') return all;
    return all.filter(c => c.status === status);
  });

  async ngOnInit() {
    const list = await this.jarvisService.getCaptures();
    this.captures.set(list);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.capture();
    }
  }

  async capture() {
    if (!this.rawInput.trim() || this.isProcessing()) return;
    this.isProcessing.set(true);

    try {
      const result = await this.jarvisService.captureThought(this.rawInput.trim());
      this.lastResult.set(result);
      this.captures.update(list => [result, ...list]);
      this.rawInput = '';
    } catch {
      // Handle error
    }

    this.isProcessing.set(false);
  }

  async routeCapture(capture: JarvisCapture) {
    await this.jarvisService.routeCapture(capture.id);
    this.captures.update(list =>
      list.map(c => c.id === capture.id ? { ...c, status: 'routed' as const } : c)
    );
    if (this.lastResult()?.id === capture.id) {
      this.lastResult.update(r => r ? { ...r, status: 'routed' as const } : r);
    }
  }

  async dismissCapture(id: string) {
    await this.jarvisService.dismissCapture(id);
    this.captures.update(list =>
      list.map(c => c.id === id ? { ...c, status: 'dismissed' as const } : c)
    );
    if (this.lastResult()?.id === id) {
      this.lastResult.set(null);
    }
  }
}
