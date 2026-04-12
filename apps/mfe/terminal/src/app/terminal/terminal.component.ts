import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisService } from '@org/jarvis';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'raja-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent implements OnInit, AfterViewChecked {
  @ViewChild('terminalBody') terminalBody!: ElementRef;
  @ViewChild('cmdInput') cmdInput!: ElementRef<HTMLInputElement>;

  private jarvisService = inject(JarvisService);

  lines = signal<TerminalLine[]>([]);
  currentInput = '';
  isProcessing = signal(false);
  commandHistory: string[] = [];
  historyIndex = -1;

  private shouldScroll = false;

  private commands: Record<string, (args: string) => Promise<string> | string> = {
    help: () =>
      [
        'Available commands:',
        '  help          — Show this help message',
        '  clear         — Clear the terminal',
        '  whoami        — About Raja',
        '  skills        — List technical skills',
        '  experience    — Career summary',
        '  projects      — List projects',
        '  contact       — Contact information',
        '  theme         — Toggle light/dark theme',
        '  date          — Show current date & time',
        '  echo <text>   — Echo text back',
        '  jarvis <msg>  — Ask Jarvis AI anything',
        '',
        'Tip: Any unrecognized command is sent to Jarvis AI.',
      ].join('\n'),

    clear: () => {
      this.lines.set([]);
      return '';
    },

    whoami: () =>
      [
        'Raja Kumarasamy',
        'Full-Stack Engineer & Tech Lead',
        'Building RajaOS — a personal operating system platform',
        'Passionate about clean architecture, AI, and developer experience.',
      ].join('\n'),

    skills: () =>
      [
        'Languages:   TypeScript, JavaScript, Python, Java, Go',
        'Frontend:    Angular, React, Module Federation, RxJS',
        'Backend:     Node.js, NestJS, Express, FastAPI',
        'Cloud:       AWS, GCP, Supabase, Docker, Kubernetes',
        'Data:        PostgreSQL, MongoDB, Redis, GraphQL',
        'Tools:       Nx, Git, CI/CD, Terraform',
        'AI/ML:       OpenAI, LangChain, RAG, Prompt Engineering',
      ].join('\n'),

    experience: () =>
      [
        'Career Timeline:',
        '  ▸ Tech Lead / Senior Engineer — Current',
        '  ▸ Full-Stack Developer — Previous roles',
        '',
        'Visit /experience for the full interactive timeline.',
      ].join('\n'),

    projects: () =>
      [
        'Featured Projects:',
        '  ▸ RajaOS       — Personal OS platform (this app)',
        '  ▸ Jarvis AI    — Personal AI assistant system',
        '  ▸ MFE Platform — Micro frontend architecture',
        '',
        'Visit /projects for all projects and demos.',
      ].join('\n'),

    contact: () =>
      [
        'Get in touch:',
        '  GitHub:    github.com/rajak',
        '  LinkedIn:  linkedin.com/in/rajak',
        '',
        'Visit /aboutme for more details.',
      ].join('\n'),

    theme: () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('raja-os-theme', next);
      return `Theme switched to ${next} mode.`;
    },

    date: () => new Date().toLocaleString(),

    echo: (args: string) => args || '',
  };

  ngOnInit() {
    this.pushLine('system', 'RajaOS Terminal v1.0 — Type "help" for available commands.');
    this.pushLine('system', 'Jarvis AI is active. Any unrecognized command is routed to Jarvis.');
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.terminalBody) {
      const el = this.terminalBody.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  focusInput() {
    this.cmdInput?.nativeElement?.focus();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.execute();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(-1);
    }
  }

  private navigateHistory(direction: number) {
    if (this.commandHistory.length === 0) return;
    this.historyIndex = Math.max(
      -1,
      Math.min(this.commandHistory.length - 1, this.historyIndex + direction),
    );
    this.currentInput =
      this.historyIndex >= 0 ? this.commandHistory[this.historyIndex] : '';
  }

  async execute() {
    const raw = this.currentInput.trim();
    if (!raw) return;

    this.pushLine('input', raw);
    this.commandHistory.unshift(raw);
    this.historyIndex = -1;
    this.currentInput = '';

    const [cmd, ...rest] = raw.split(' ');
    const args = rest.join(' ');
    const key = cmd.toLowerCase();

    if (key in this.commands) {
      const result = this.commands[key](args);
      const output = result instanceof Promise ? await result : result;
      if (output) {
        this.pushLine('output', output);
      }
    } else if (key === 'jarvis') {
      await this.askJarvis(args || 'Hello');
    } else {
      // Route unknown commands to Jarvis
      await this.askJarvis(raw);
    }
  }

  private async askJarvis(message: string) {
    this.isProcessing.set(true);
    this.pushLine('system', 'Jarvis is thinking...');

    try {
      const response = await this.jarvisService.chat(message);
      // Remove the "thinking" line
      this.lines.update((l) => l.slice(0, -1));
      this.pushLine('output', `[Jarvis] ${response}`);
    } catch (error: unknown) {
      this.lines.update((l) => l.slice(0, -1));
      const errMsg = error instanceof Error ? error.message : 'Something went wrong';
      this.pushLine('error', `[Jarvis Error] ${errMsg}`);
    }

    this.isProcessing.set(false);
  }

  private pushLine(type: TerminalLine['type'], text: string) {
    this.lines.update((l) => [...l, { type, text, timestamp: new Date() }]);
    this.shouldScroll = true;
  }
}
