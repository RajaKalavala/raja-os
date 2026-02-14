import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { AdminLoginModalComponent } from '../components/admin-login-modal/admin-login-modal.component';
import { DevUptimeComponent } from '../components/dev-uptime/dev-uptime.component';
import { IdentityCardComponent } from '../components/identity-card/identity-card.component';
import { LifeStatsComponent } from '../components/life-stats/life-stats.component';
import { NowPlayingComponent } from '../components/now-playing/now-playing.component';
import { CurrentlyBuildingComponent } from '../components/currently-building/currently-building.component';
import { SkillTreeComponent } from '../components/skill-tree/skill-tree.component';
import { GithubHeatmapComponent } from '../components/github-heatmap/github-heatmap.component';
import { DeveloperJourneyComponent } from '../components/developer-journey/developer-journey.component';
import { LatestPostComponent } from '../components/latest-post/latest-post.component';
import { VisitorCounterComponent } from '../components/visitor-counter/visitor-counter.component';
import { QuickLaunchComponent } from '../components/quick-launch/quick-launch.component';
import { AuthService } from '../services/auth.service';

interface MetricCard {
  title: string;
  value: string;
  subtext: string;
  isPrimary?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    AdminLoginModalComponent,
    DevUptimeComponent,
    IdentityCardComponent,
    LifeStatsComponent,
    NowPlayingComponent,
    CurrentlyBuildingComponent,
    SkillTreeComponent,
    GithubHeatmapComponent,
    DeveloperJourneyComponent,
    LatestPostComponent,
    VisitorCounterComponent,
    QuickLaunchComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {
  showLoginModal = signal<boolean>(false);
  authService = inject(AuthService);

  private storageListener = (e: StorageEvent) => {
    if (e.key === 'openAdminLogin') {
      this.openLoginModal();
      localStorage.removeItem('openAdminLogin');
    }
  };

  ngOnInit() {
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageListener);
  }

  metricCards: MetricCard[] = [
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
