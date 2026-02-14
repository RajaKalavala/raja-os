import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'raja-projects-entry',
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntry {}
