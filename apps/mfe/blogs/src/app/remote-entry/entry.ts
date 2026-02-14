import { Component } from '@angular/core';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome],
  selector: 'raja-blogs-entry',
  template: `<raja-nx-welcome></raja-nx-welcome>`,
})
export class RemoteEntry {}
