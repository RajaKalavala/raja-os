import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackerComponent } from '../time-tracker/time-tracker.component';
import { AdminLoginModalComponent } from '../components/admin-login-modal/admin-login-modal.component';
import { AuthService } from '../services/auth.service';

interface MetricCard {
  title: string;
  value: string;
  subtext: string;
  isPrimary?: boolean;
}

interface CareerMilestone {
  year: number;
  role: string;
  level: number;
  company?: string;
  isTransition?: boolean;
}

interface ContributionSegment {
  label: string;
  percentage: number;
  color: string;
}

interface ImpactArea {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TimeTrackerComponent, AdminLoginModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {
  showLoginModal = signal<boolean>(false);

  constructor(public authService: AuthService) {}
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

  careerTimeline: CareerMilestone[] = [
    { year: 2016, role: 'Software Engineer', level: 1, company: 'Company 1', isTransition: true },
    { year: 2017, role: 'Senior Engineer', level: 2, company: 'Company 1' },
    { year: 2018, role: 'Tech Lead', level: 2.8, company: 'Company 1' },
    { year: 2019, role: 'Engineering Lead', level: 3.5, company: 'Company 2', isTransition: true },
    { year: 2020, role: 'Principal Engineer', level: 4.2, company: 'Company 2' },
    { year: 2021, role: 'Principal Engineer', level: 4.5, company: 'Company 2' },
    { year: 2022, role: 'Senior Principal', level: 5, company: 'Company 3', isTransition: true },
    { year: 2023, role: 'Staff Engineer', level: 5.2, company: 'Company 3' },
    { year: 2024, role: 'Staff Engineer', level: 5.5, company: 'Company 3' },
    { year: 2025, role: 'Tech Architect', level: 5.7, company: 'Company 3' },
    { year: 2026, role: 'Staff Architect', level: 6, company: 'Company 3' },
  ];

  contributionDistribution: ContributionSegment[] = [
    { label: 'Architecture Design', percentage: 35, color: '#1a5f3f' },
    { label: 'Backend Development', percentage: 30, color: '#2d7a5a' },
    { label: 'Data Engineering', percentage: 20, color: '#4a9d7a' },
    { label: 'AI / ML Systems', percentage: 15, color: '#22c55e' },
  ];

  impactAreas: ImpactArea[] = [
    { label: 'System Design', value: 95 },
    { label: 'Scalability', value: 90 },
    { label: 'Reliability', value: 88 },
    { label: 'Performance', value: 92 },
    { label: 'Mentorship', value: 85 },
  ];

  currentFocusCompletion = 41;
  currentFocusItems = [
    'Architecture Research',
    'AI Thesis',
    'Platform Enhancements',
    'Personal Product (StreetBites)',
  ];

  currentFocusList = [
    'Designing Explainable RAG systems',
    'Building scalable ingestion pipelines',
    'Writing AI/ML thesis',
    'Developing RajaOS platform',
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

  getCareerMaxLevel(): number {
    return Math.max(...this.careerTimeline.map((m) => m.level));
  }

  getCareerMinLevel(): number {
    return Math.min(...this.careerTimeline.map((m) => m.level));
  }

  getCareerLevelPercentage(level: number): number {
    const min = this.getCareerMinLevel();
    const max = this.getCareerMaxLevel();
    return ((level - min) / (max - min)) * 100;
  }

  getProgressArcPath(): string {
    const percentage = this.currentFocusCompletion;
    const radius = 60;
    const centerX = 100;
    const centerY = 100;
    const endAngle = Math.PI - (percentage / 100) * Math.PI;
    const startX = centerX - radius;
    const startY = centerY;
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY - radius * Math.sin(endAngle);
    const largeArcFlag = percentage > 50 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  }

  getPieDashArray(percentage: number): string {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const dashLength = (percentage / 100) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getPieDashOffset(index: number): number {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      // Start from -90 degrees (top)
      // Just cumulative length
      offset -=
        (this.contributionDistribution[i].percentage / 100) * circumference;
    }
    // No +25% offset needed if we rotate the SVG -90deg in CSS/SVG transform.
    // However, SVG circles start at 3 o'clock. -90 takes them to 12 o'clock.
    return offset;
  }

  getCareerPath(): string {
    return (
      'M ' +
      this.careerTimeline
        .map(
          (m, i) =>
            i * 60 +
            40 +
            ',' +
            (180 - this.getCareerLevelPercentage(m.level) * 1.4),
        )
        .join(' L ') +
      ' L ' +
      (this.careerTimeline.length * 60 - 20) +
      ',180 L 40,180 Z'
    );
  }

  getCareerPoints(): string {
    return this.careerTimeline
      .map(
        (m, i) =>
          i * 60 +
          40 +
          ',' +
          (180 - this.getCareerLevelPercentage(m.level) * 1.4),
      )
      .join(' ');
  }

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
