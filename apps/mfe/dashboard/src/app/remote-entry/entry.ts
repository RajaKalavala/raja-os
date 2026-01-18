import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  imports: [DashboardComponent],
  selector: 'app-dashboard-entry',
  template: `<app-dashboard></app-dashboard>`,
})
export class RemoteEntry {}
