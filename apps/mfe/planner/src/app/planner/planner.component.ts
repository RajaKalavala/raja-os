import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlannerService } from '../services/planner.service';
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from '../models/planner.models';

@Component({
  selector: 'raja-planner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent {
  readonly plannerService = inject(PlannerService);
  readonly stats = this.plannerService.stats;
  readonly missionsWithProgress = this.plannerService.missionsWithProgress;
  readonly categoryConfig = CATEGORY_CONFIG;
  readonly priorityConfig = PRIORITY_CONFIG;
  readonly taskStatusConfig = TASK_STATUS_CONFIG;
}
