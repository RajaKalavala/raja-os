import { Component } from '@angular/core';
import { PlannerComponent } from '../planner/planner.component';

@Component({
  imports: [PlannerComponent],
  selector: 'raja-planner-entry',
  template: `<raja-planner></raja-planner>`,
})
export class RemoteEntry {}
