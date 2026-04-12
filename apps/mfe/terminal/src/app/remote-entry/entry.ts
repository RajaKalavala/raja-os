import { Component } from '@angular/core';
import { TerminalComponent } from '../terminal/terminal.component';

@Component({
  imports: [TerminalComponent],
  selector: 'raja-terminal-entry',
  template: `<raja-terminal></raja-terminal>`,
})
export class RemoteEntry {}
