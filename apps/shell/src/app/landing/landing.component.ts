import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  inject,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type Phase = 'hero' | 'boot';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

interface BootLine {
  text: string;
  delay: number;
  typed: string;
  done: boolean;
  showCheck: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];
  private mouse = { x: 0, y: 0 };
  private typingTimers: ReturnType<typeof setInterval>[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  // Phase management
  phase = signal<Phase>('hero');
  heroVisible = signal(false);
  buttonHovered = signal(false);

  // Boot sequence state
  bootLines = signal<BootLine[]>([
    { text: 'Raja OS BIOS v1.0.0', delay: 0, typed: '', done: false, showCheck: false },
    { text: 'Initializing kernel modules.............. OK', delay: 400, typed: '', done: false, showCheck: true },
    { text: 'Loading framework: Angular 19.0.0........ OK', delay: 800, typed: '', done: false, showCheck: true },
    { text: 'Mounting workspace: Nx Monorepo.......... OK', delay: 1100, typed: '', done: false, showCheck: true },
    { text: 'Compiling components: 47 modules found... OK', delay: 1400, typed: '', done: false, showCheck: true },
  ]);
  bootPhase = signal(0); // 0=text, 1=progress, 2=logo, 3=done
  bootProgress = signal(0);
  visibleBootLines = signal<number[]>([]);

  // Bottom info items
  infoItems = [
    { label: 'Architecture', value: 'Microfrontend' },
    { label: 'Framework', value: 'Angular + Nx' },
    { label: 'Status', value: '● Operational' },
  ];

  ngOnInit(): void {
    // Show hero content after a short delay
    const t = setTimeout(() => this.heroVisible.set(true), 200);
    this.timeouts.push(t);
  }

  ngAfterViewInit(): void {
    this.initParticleSystem();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.typingTimers.forEach(t => clearInterval(t));
    this.timeouts.forEach(t => clearTimeout(t));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.phase() === 'hero') {
      this.startBootSequence();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  @HostListener('window:resize')
  handleResize(): void {
    if (this.canvasRef?.nativeElement) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  private initParticleSystem(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    const count = 70;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      if (!canvas || !ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse attraction
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00003;
          p.vy += dy * 0.00003;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(62, 207, 113, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x, this.particles[i].y);
            ctx.lineTo(this.particles[j].x, this.particles[j].y);
            ctx.strokeStyle = `rgba(62, 207, 113, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  startBootSequence(): void {
    this.phase.set('boot');
    this.runBootSequence();
  }

  private runBootSequence(): void {
    const lines = this.bootLines();

    // Show lines progressively
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        this.visibleBootLines.update(v => [...v, i]);
        this.typeText(i, line.text);
      }, line.delay);
      this.timeouts.push(t);
    });

    // Phase 1: Progress bar
    const t1 = setTimeout(() => this.bootPhase.set(1), 1900);
    this.timeouts.push(t1);

    // Animate progress
    const t2 = setTimeout(() => {
      let p = 0;
      const interval = setInterval(() => {
        p += 4;
        this.bootProgress.set(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(interval);
          const t3 = setTimeout(() => this.bootPhase.set(2), 300);
          this.timeouts.push(t3);
        }
      }, 40);
      this.typingTimers.push(interval);
    }, 2000);
    this.timeouts.push(t2);

    // Phase 2: Logo reveal -> Navigate to dashboard
    const t4 = setTimeout(() => this.bootPhase.set(3), 4200);
    this.timeouts.push(t4);

    const t5 = setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 5200);
    this.timeouts.push(t5);
  }

  private typeText(index: number, text: string): void {
    let i = 0;
    const speed = 18;
    const timer = setInterval(() => {
      this.bootLines.update(lines => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], typed: text.slice(0, i + 1) };
        if (i >= text.length - 1) {
          newLines[index].done = true;
        }
        return newLines;
      });
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, speed);
    this.typingTimers.push(timer);
  }

  skipBoot(): void {
    this.router.navigate(['/dashboard']);
  }

  getProgressBar(): string {
    const barWidth = 30;
    const filled = Math.round((this.bootProgress() / 100) * barWidth);
    const empty = barWidth - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  setButtonHovered(value: boolean): void {
    this.buttonHovered.set(value);
  }
}
