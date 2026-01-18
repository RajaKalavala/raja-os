import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {
  metricCards: MetricCard[] = [
    {
      title: 'Total Experience',
      value: '10+ Years',
      subtext: 'Across enterprise & platform systems',
      isPrimary: true,
    },
    {
      title: 'Systems in Production',
      value: '15+',
      subtext: 'High-scale distributed systems',
    },
    {
      title: 'Daily Data Processed',
      value: '1M+',
      subtext: 'Events & product updates per day',
    },
    {
      title: 'Core Focus Areas',
      value: '5',
      subtext: 'Data, AI, Platform, Cloud, Architecture',
    },
  ];

  careerTimeline: CareerMilestone[] = [
    { year: 2014, role: 'Junior Engineer', level: 1 },
    { year: 2016, role: 'Engineer', level: 2 },
    { year: 2018, role: 'Senior Engineer', level: 3 },
    { year: 2020, role: 'Tech Lead', level: 4 },
    { year: 2022, role: 'Principal Engineer', level: 4.5 },
    { year: 2024, role: 'Architect', level: 5 },
    { year: 2026, role: 'Senior Architect', level: 5.5 },
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
    const startAngle = Math.PI; // 180 degrees
    const endAngle = Math.PI - (percentage / 100) * Math.PI;
    const startX = centerX - radius;
    const startY = centerY;
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY - radius * Math.sin(endAngle);
    const largeArcFlag = percentage > 50 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  }

  getPieDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 80; // radius = 80
    const dashLength = (percentage / 100) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getPieDashOffset(index: number): number {
    const circumference = 2 * Math.PI * 80;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset -= (this.contributionDistribution[i].percentage / 100) * circumference;
    }
    return offset;
  }

  getCareerPath(): string {
    return (
      'M ' +
      this.careerTimeline
        .map(
          (m, i) =>
            i * 60 + 40 + ',' + (180 - this.getCareerLevelPercentage(m.level) * 1.4)
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
          i * 60 + 40 + ',' + (180 - this.getCareerLevelPercentage(m.level) * 1.4)
      )
      .join(' ');
  }
}
