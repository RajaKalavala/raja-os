import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  AfterViewInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

interface PhilosophyCard {
  emoji: string;
  title: string;
  description: string;
}

interface Interest {
  icon: string;
  label: string;
}

interface SetupItem {
  category: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'raja-about-me',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
})
export class AboutMeComponent implements OnInit, AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];
  private countAnimationFrames: number[] = [];

  // Section visibility signals
  storyVisible = signal(false);
  statsVisible = signal(false);
  philosophyVisible = signal(false);
  beyondCodeVisible = signal(false);
  setupVisible = signal(false);
  connectVisible = signal(false);

  // Stats data with signal for animated values
  stats: Stat[] = [
    { value: 9, suffix: '+', label: 'Years Experience' },
    { value: 3, suffix: '', label: 'Companies' },
    { value: 5, suffix: '+', label: 'Projects Delivered' },
    { value: 284, suffix: 'k+', label: 'Lines of Code' },
  ];

  // Signal to hold current animated values
  statValues = signal<number[]>([0, 0, 0, 0]);

  // Philosophy cards
  philosophyCards: PhilosophyCard[] = [
    {
      emoji: '🏗️',
      title: 'Architecture is Communication',
      description:
        "Good architecture makes complex systems understandable. If you can't explain it simply, you don't understand it well enough.",
    },
    {
      emoji: '🚀',
      title: 'Ship Early, Learn Fast',
      description:
        'Iterative delivery over perfect planning. Real user feedback beats assumptions every time.',
    },
    {
      emoji: '👥',
      title: 'Code is for Humans',
      description:
        'Readable code > clever code. Every time. Your future self will thank you.',
    },
    {
      emoji: '🌱',
      title: 'Mentor to Grow',
      description:
        'Teaching others solidifies my own understanding. We rise by lifting others.',
    },
  ];

  // Interests
  interests: Interest[] = [
    { icon: '✈️', label: 'Traveling' },
    { icon: '⚽', label: 'Football' },
    { icon: '🏸', label: 'Badminton' },
    { icon: '🎮', label: 'Gaming' },
    { icon: '📚', label: 'Reading' },
    { icon: '☕', label: 'Coffee' },
  ];

  currentlyReading = 'System Design Interview by Alex Xu';
  currentlyLearning = 'Rust & WebAssembly';

  // About JSON for easter egg
  aboutJson = `{
  "name": "Raja Kalavala",
  "role": "Principal Software Architect",
  "location": "Bangalore, India",
  "loves": [
    "clean architecture",
    "microfrontends",
    "system design",
    "mentoring"
  ],
  "hobbies": [
    "traveling",
    "football",
    "badminton",
    "gaming"
  ],
  "motto": "Ship it. Learn. Iterate.",
  "currently": {
    "building": "Raja OS",
    "learning": "GenAI & LLMs",
    "reading": "System Design Interview"
  }
}`;

  // Setup items
  setupItems: SetupItem[] = [
    { category: 'Editor', name: 'VS Code + One Dark Pro', icon: '💻' },
    { category: 'Terminal', name: 'iTerm2 + Oh My Zsh', icon: '⌨️' },
    { category: 'Browser', name: 'Arc / Chrome', icon: '🌐' },
    { category: 'OS', name: 'macOS Sonoma', icon: '🍎' },
    { category: 'Notes', name: 'Notion + Obsidian', icon: '📝' },
    { category: 'Design', name: 'Figma', icon: '🎨' },
  ];

  // Social links
  socialLinks = [
    { url: 'https://github.com/RajaKalavala', icon: 'github', label: 'GitHub' },
    {
      url: 'https://www.linkedin.com/in/rajakalavala/',
      icon: 'linkedin',
      label: 'LinkedIn',
    },
    { url: 'https://x.com/raja_kalavala', icon: 'twitter', label: 'Twitter' },
  ];

  ngOnInit(): void {
    // Stats are initialized with signal default values
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObservers();
  }

  ngOnDestroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.countAnimationFrames.forEach((frame) => cancelAnimationFrame(frame));
  }

  private setupIntersectionObservers(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    // Story section
    this.createObserver(
      'story-section',
      () => this.storyVisible.set(true),
      options,
    );

    // Stats section with number animation
    this.createObserver(
      'stats-section',
      () => {
        this.statsVisible.set(true);
        this.animateStats();
      },
      options,
    );

    // Philosophy section
    this.createObserver(
      'philosophy-section',
      () => this.philosophyVisible.set(true),
      options,
    );

    // Beyond code section
    this.createObserver(
      'beyond-section',
      () => this.beyondCodeVisible.set(true),
      options,
    );

    // Setup section
    this.createObserver(
      'setup-section',
      () => this.setupVisible.set(true),
      options,
    );

    // Connect section
    this.createObserver(
      'connect-section',
      () => this.connectVisible.set(true),
      options,
    );
  }

  private createObserver(
    elementId: string,
    callback: () => void,
    options: IntersectionObserverInit,
  ): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(element);
    this.observers.push(observer);
  }

  private animateStats(): void {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Update signal with new animated values
      const newValues = this.stats.map((stat) =>
        Math.floor(stat.value * easeOut),
      );
      this.statValues.set(newValues);

      if (progress < 1) {
        const frame = requestAnimationFrame(animate);
        this.countAnimationFrames.push(frame);
      }
    };

    const frame = requestAnimationFrame(animate);
    this.countAnimationFrames.push(frame);
  }

  // Helper method to get current value for a stat by index
  getStatValue(index: number): number {
    return this.statValues()[index];
  }
}
