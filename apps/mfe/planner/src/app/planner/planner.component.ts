import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'raja-planner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent {
  readonly summaryCards = [
    {
      label: 'Missions',
      count: 0,
      icon: 'target',
      description: 'High-level goals & projects',
    },
    {
      label: 'Milestones',
      count: 0,
      icon: 'flag',
      description: 'Key outcomes within missions',
    },
    {
      label: 'Tasks',
      count: 0,
      icon: 'check',
      description: 'Actionable items to complete',
    },
  ];
}
