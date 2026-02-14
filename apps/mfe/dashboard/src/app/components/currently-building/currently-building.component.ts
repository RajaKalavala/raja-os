import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  name: string;
  techStack: string[];
  progress: number;
  sprint: {
    current: number;
    total: number;
  };
  status: 'on-track' | 'at-risk' | 'delayed';
}

@Component({
  selector: 'app-currently-building',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currently-building.component.html',
  styleUrls: ['./currently-building.component.scss'],
})
export class CurrentlyBuildingComponent {
  project: Project = {
    name: 'Raja OS Portfolio',
    techStack: ['Angular', 'Nx', 'MFE'],
    progress: 65,
    sprint: {
      current: 4,
      total: 6,
    },
    status: 'on-track',
  };

  getStatusLabel(): string {
    switch (this.project.status) {
      case 'on-track':
        return 'On Track';
      case 'at-risk':
        return 'At Risk';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(): string {
    return this.project.status;
  }

  // Calculate stroke-dasharray and stroke-dashoffset for the progress ring
  getCircumference(): number {
    return 2 * Math.PI * 40; // radius = 40
  }

  getStrokeDashoffset(): number {
    const circumference = this.getCircumference();
    return circumference - (this.project.progress / 100) * circumference;
  }
}
