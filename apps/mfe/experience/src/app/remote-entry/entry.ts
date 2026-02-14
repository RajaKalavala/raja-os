import { Component } from '@angular/core';
import { ExperienceComponent } from '../experience/experience.component';

@Component({
  imports: [ExperienceComponent],
  selector: 'raja-experience-entry',
  template: `<app-experience></app-experience>`,
})
export class RemoteEntry {}
