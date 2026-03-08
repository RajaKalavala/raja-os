import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'raja-jarvis-entry',
  template: `
    <div class="jarvis-shell">
      <!-- Jarvis Sub-Navigation -->
      <nav class="jarvis-nav">
        <a routerLink="/jarvis" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Home
        </a>
        <a routerLink="/jarvis/briefing" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
          Briefing
        </a>
        <a routerLink="/jarvis/chat" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Chat
        </a>
        <a routerLink="/jarvis/focus" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Focus
        </a>
        <a routerLink="/jarvis/capture" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Capture
        </a>
        <a routerLink="/jarvis/metrics" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Metrics
        </a>
        <a routerLink="/jarvis/review" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          Review
        </a>
        <a routerLink="/jarvis/memory" routerLinkActive="active" class="jarvis-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path><path d="M12 8v4l3 3"></path></svg>
          Memory
        </a>
      </nav>
      <div class="jarvis-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .jarvis-shell {
      min-height: 100vh;
      background: var(--jarvis-bg, #0a0a0a);
      color: var(--jarvis-text, #e5e7eb);
      font-family: var(--jarvis-font, 'JetBrains Mono', 'Fira Code', monospace);
    }

    .jarvis-nav {
      display: flex;
      gap: 4px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--jarvis-border, #1f1f1f);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        height: 0;
      }
    }

    .jarvis-nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--jarvis-text-muted, #6b7280);
      text-decoration: none;
      white-space: nowrap;
      transition: all 150ms;

      &:hover {
        color: var(--jarvis-text, #e5e7eb);
        background: var(--jarvis-surface, #111111);
      }

      &.active {
        color: var(--jarvis-primary, #10b981);
        background: rgba(16, 185, 129, 0.1);
      }
    }

    .jarvis-content {
      padding: 24px;
    }

    @media (max-width: 768px) {
      .jarvis-nav {
        padding: 12px 16px;
      }
      .jarvis-content {
        padding: 16px;
      }
    }
  `],
})
export class RemoteEntry {}
