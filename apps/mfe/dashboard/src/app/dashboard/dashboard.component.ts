import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';
import { AdminLoginModalComponent } from '../components/admin-login-modal/admin-login-modal.component';
import { IdentityCardComponent } from '../components/identity-card/identity-card.component';
import { LifeStatsComponent } from '../components/life-stats/life-stats.component';
import { NowPlayingComponent } from '../components/now-playing/now-playing.component';
import { CurrentlyBuildingComponent } from '../components/currently-building/currently-building.component';
import { SkillTreeComponent } from '../components/skill-tree/skill-tree.component';
import { GithubHeatmapComponent } from '../components/github-heatmap/github-heatmap.component';
import { DeveloperJourneyComponent } from '../components/developer-journey/developer-journey.component';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

interface MetricCard {
  title: string;
  value: string;
  subtext: string;
  isPrimary?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TimeTrackerComponent,
    AdminLoginModalComponent,
    IdentityCardComponent,
    LifeStatsComponent,
    NowPlayingComponent,
    CurrentlyBuildingComponent,
    SkillTreeComponent,
    GithubHeatmapComponent,
    DeveloperJourneyComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {
  showLoginModal = signal<boolean>(false);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  metricCards: MetricCard[] = [
    {
      title: 'Total Experience',
      value: '9+ Years',
      subtext: 'Design & Development Across Web and Mobile Apps',
      isPrimary: true,
    },
    {
      title: 'Worked on ',
      value: '15+',
      subtext:
        'Projects : E-Commerce, Healthcare, Platform, Mobile and Web Apps',
    },
    {
      title: 'LinkedIn Community',
      value: '1K+',
      subtext: 'Connections',
    },
    {
      title: 'Core Focus Areas',
      value: '5',
      subtext: 'Architecture, AI, Data, System Design, Platform',
    },
  ];

  currentFocusItems = [
    'Architecture Research',
    'AI Thesis',
    'Platform Enhancements',
    'Personal Product (StreetBites)',
  ];

  featuredBuilds = [
    {
      name: 'Arsenal Platform',
      desc: 'Centralized limit funds, commerce systems',
      icon: 'assets/cube.svg', // Placeholder
    },
    {
      name: 'AI Enrichment Pipeline',
      desc: 'Actionable rich data, re-engineering',
      icon: 'assets/pipeline.svg', // Placeholder
    },
  ];

  openLoginModal(): void {
    this.showLoginModal.set(true);
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
