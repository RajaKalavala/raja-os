import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Milestone {
  year: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-developer-journey',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-journey.component.html',
  styleUrls: ['./developer-journey.component.scss'],
})
export class DeveloperJourneyComponent {
  currentMilestone = signal(4); // Index of current milestone (NOW)

  milestones: Milestone[] = [
    {
      year: 2016,
      title: 'Software Engineer',
      description:
        'Started professional journey of software developer in Happiest Minds',
      icon: '🌱',
      color: '#10b981',
    },
    {
      year: 2019,
      title: 'Design & Development Engineer',
      description:
        'Transitioned to Design & Development at Siemens Healthineers',
      icon: '🚀',
      color: '#8b5cf6',
    },
    {
      year: 2021,
      title: 'Senior Design & Development Engineer',
      description:
        'Transitioned to Senior Design & Development at Siemens Healthineers',
      icon: '🚀',
      color: '#8b5cf6',
    },
    {
      year: 2022,
      title: 'Senior Software Engineer',
      description:
        'Transitioned to Senior Software Engineer at Dell Technologies',
      icon: '⚡',
      color: '#f59e0b',
    },
    {
      year: 0,
      title: 'Software Principal Engineer',
      description:
        'Transitioned to Software Principal Engineer at Dell Technologies',
      icon: '🔮',
      color: '#ec4899',
    },
  ];

  selectMilestone(index: number): void {
    this.currentMilestone.set(index);
  }

  getProgressPercentage(): number {
    return ((this.currentMilestone() + 1) / this.milestones.length) * 100;
  }
}
