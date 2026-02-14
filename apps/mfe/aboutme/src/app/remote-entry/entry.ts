import { Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';

@Component({
  imports: [AboutMeComponent],
  selector: 'raja-aboutme-entry',
  template: `<raja-about-me></raja-about-me>`,
})
export class RemoteEntry {}
