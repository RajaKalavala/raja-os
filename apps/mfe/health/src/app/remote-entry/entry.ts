import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'raja-health-entry',
  template: `
    <div class="health-shell">
      <nav class="health-nav">
        <a routerLink="/health" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Home
        </a>
        <a routerLink="/health/vitals" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Vitals
        </a>
        <a routerLink="/health/fitness" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h3M19 12h3M6.5 6.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2M17.5 6.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2"></path></svg>
          Fitness
        </a>
        <a routerLink="/health/vault" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Vault
        </a>
        <a routerLink="/health/labs" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 7H5l4-7V3z"></path><line x1="9" y1="3" x2="15" y2="3"></line></svg>
          Labs
        </a>
        <a routerLink="/health/advisor" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Advisor
        </a>
        <a routerLink="/health/medications" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Meds
        </a>
        <a routerLink="/health/emergency" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Emergency
        </a>
        <a routerLink="/health/body-map" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="11" x2="16" y2="11"></line><line x1="9" y1="22" x2="12" y2="16"></line><line x1="15" y1="22" x2="12" y2="16"></line></svg>
          Body Map
        </a>
        <a routerLink="/health/correlations" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          Correlations
        </a>
        <a routerLink="/health/timeline" routerLinkActive="active" class="health-nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Timeline
        </a>
      </nav>
      <div class="health-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .health-shell {
      min-height: 100vh;
      background: var(--bg-page, #f9fafb);
      color: var(--text-primary, #111827);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .health-nav {
      display: flex;
      gap: 4px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-primary, #e5e7eb);
      overflow-x: auto;
      background: var(--bg-card, #ffffff);
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        height: 0;
      }
    }

    .health-nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #6b7280);
      text-decoration: none;
      white-space: nowrap;
      transition: all 150ms;

      &:hover {
        color: var(--text-primary, #111827);
        background: var(--bg-card-alt, #f3f4f6);
      }

      &.active {
        color: var(--accent-green, #22c55e);
        background: rgba(34, 197, 94, 0.1);
      }
    }

    .health-content {
      padding: 24px;
    }

    @media (max-width: 768px) {
      .health-nav {
        padding: 12px 16px;
      }
      .health-content {
        padding: 16px;
      }
    }
  `],
})
export class RemoteEntry {}
