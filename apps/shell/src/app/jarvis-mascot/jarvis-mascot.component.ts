import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SupabaseService } from '@org/supabase';
import { filter } from 'rxjs';

type MascotMood = 'idle' | 'thinking' | 'happy' | 'sleeping' | 'alert' | 'waving' | 'celebrating' | 'looking' | 'dancing';

interface MascotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-jarvis-mascot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jarvis-mascot.component.html',
  styleUrl: './jarvis-mascot.component.scss',
})
export class JarvisMascotComponent implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  mood = signal<MascotMood>('idle');
  isChatOpen = signal(false);
  messages = signal<MascotMessage[]>([]);
  inputText = '';
  isTyping = signal(false);
  speechBubble = signal<string | null>(null);

  readonly isAdmin = computed(() => this.supabase.isAdmin());

  private speechTimeout: ReturnType<typeof setTimeout> | null = null;
  private idleInterval: ReturnType<typeof setInterval> | null = null;
  private greetingShown = false;
  private routerSub: { unsubscribe(): void } | null = null;

  readonly publicQuickPrompts = [
    'Who is Raja?',
    'What are his skills?',
    'Tell me about his projects',
    'How to contact him?',
  ];

  readonly adminQuickPrompts = [
    "How's my day going?",
    'What should I focus on?',
    'Give me a motivational push',
    'Quick productivity tip',
  ];

  readonly quickPrompts = computed(() =>
    this.isAdmin() ? this.adminQuickPrompts : this.publicQuickPrompts
  );

  private publicResponses: Record<string, string> = {
    hello: "Hey there! I'm Jarvis, Raja's AI assistant. Ask me about his skills, experience, or projects!",
    hi: "Hello! Welcome to RajaOS. I'm Jarvis — here to tell you about Raja. What would you like to know?",
    hey: "Hey! Great to see you here. I know everything about Raja — try me!",
    who: "Raja Kalavala is a Principal Software Engineer at Dell Technologies with 9+ years of experience building scalable systems. He's passionate about frontend architecture, AI, and shipping fast. This entire site is his creation!",
    skills: "Raja's core stack: Angular, React, TypeScript, Node.js, Python. He's deep into system design, micro-frontends, and AI integration. He built this entire platform using Angular 21, Nx, Module Federation, and Supabase!",
    experience: "Raja's journey:\n\n• Dell Technologies (2022-now) — Principal Engineer, building enterprise-scale platforms\n• Siemens Healthineers (2019-2021) — Design & Dev Engineer\n• Happiest Minds (2016-2018) — Software Engineer\n\nCheck the Experience page for the full story!",
    project: "Raja has built some impressive things! This site (RajaOS) is a micro-frontend showcase with AI features. Head to the Projects page for detailed case studies with tech stacks and results.",
    contact: "Want to reach Raja? Connect with him on LinkedIn — he's always up for interesting conversations about engineering and AI!",
    education: "Raja holds a Post-Graduate degree from IIIT Bangalore in Machine Learning & AI, and a B.Tech in ECE from Centurion University.",
    rajaos: "You're looking at it! RajaOS is a personal operating system built as micro-frontends. Each page is independently deployable. Angular 21 + Nx + Webpack Module Federation + Supabase + GPT-4o. Pretty wild, right?",
    hire: "Raja is a Principal Engineer with deep expertise in scalable architectures. Connect with him on LinkedIn — he's open to exciting opportunities and collaborations!",
    angular: "Angular is one of Raja's strongest suits! He's been working with it since the early versions and now builds enterprise apps with Angular 21, standalone components, and signals.",
    ai: "Raja is big on AI! He has a Post-Grad in ML & AI from IIIT-B, and he integrates GPT-4o into real products — like this very site's Jarvis assistant!",
    focus: "Raja believes in deep work. He built a Focus Session manager right into this OS! Lock in, minimize distractions, and ship.",
    default: "Hmm, interesting question! I know a lot about Raja — try asking about his skills, experience, projects, or education. Or just explore the site!",
  };

  private funFacts = [
    'Did you know? Raja has written over 284k lines of code!',
    'Fun fact: This entire site is built with micro-frontends!',
    'Pro tip: Check out the Projects page for detailed case studies.',
    "Raja's been coding since 2016. That's a lot of keyboard clicks!",
    'This site runs on Angular 21, Nx, and pure engineering passion.',
    "I'm an AI mascot built with CSS animations. No frameworks, just vibes.",
    'Try clicking on different pages — each one is its own mini-app!',
    'Raja holds a Post-Grad from IIIT-B in ML & AI. Big brain energy!',
    "pssst... try double-clicking me for a surprise!",
  ];

  private adminFacts = [
    'How about a focus session today?',
    'Remember: ship early, learn fast!',
    'Press Cmd+Shift+J for quick capture!',
    'Have you checked your goals this week?',
    "Don't forget your morning briefing!",
  ];

  ngOnInit() {
    this.setTimeBasedMood();

    setTimeout(() => {
      if (this.mood() === 'sleeping') {
        this.showSpeechBubble('*zzz*... oh! Hey... working late?');
      } else {
        this.mood.set('waving');
        this.showSpeechBubble(
          this.isAdmin()
            ? 'Welcome back, boss! Ready to crush it?'
            : "Hey! I'm Jarvis. Click me to chat!"
        );
      }
      setTimeout(() => {
        if (this.mood() !== 'sleeping') this.mood.set('idle');
      }, 2500);
      this.greetingShown = true;
    }, 2500);

    this.idleInterval = setInterval(
      () => {
        if (this.mood() === 'idle' && !this.isChatOpen()) {
          this.playRandomIdle();
        }
      },
      35000 + Math.random() * 25000
    );

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.reactToNav(e.url));
  }

  ngOnDestroy() {
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    if (this.idleInterval) clearInterval(this.idleInterval);
    this.routerSub?.unsubscribe();
  }

  toggleChat() {
    this.isChatOpen.update((v) => !v);
    if (this.isChatOpen()) {
      this.speechBubble.set(null);
      this.mood.set('happy');
      setTimeout(() => this.mood.set('idle'), 1000);

      if (this.messages().length === 0) {
        this.messages.set([
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: this.isAdmin()
              ? "Hey boss! I'm your personal AI sidekick. What's on your mind?"
              : "Hi there! I'm Jarvis, Raja's AI buddy. Ask me anything about him!",
          },
        ]);
      }
    }
  }

  async sendMessage() {
    if (!this.inputText.trim() || this.isTyping()) return;
    const userText = this.inputText.trim();
    this.inputText = '';

    this.messages.update((msgs) => [
      ...msgs,
      { id: crypto.randomUUID(), role: 'user', content: userText },
    ]);
    this.isTyping.set(true);
    this.mood.set('thinking');

    try {
      let response: string;
      const apiKey = localStorage.getItem('raja-os-openai-key');

      if (apiKey) {
        const prompt = this.isAdmin() ? this.adminPrompt() : this.publicPrompt();
        response = await this.callAI(apiKey, prompt, userText);
      } else {
        response = this.getPresetResponse(userText);
      }

      this.messages.update((msgs) => [
        ...msgs,
        { id: crypto.randomUUID(), role: 'assistant', content: response },
      ]);
      this.mood.set('happy');
      setTimeout(() => this.mood.set('idle'), 1500);
    } catch {
      this.messages.update((msgs) => [
        ...msgs,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Oops, my circuits got tangled! Try again?',
        },
      ]);
      this.mood.set('idle');
    }

    this.isTyping.set(false);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  useQuickPrompt(text: string) {
    this.inputText = text;
    this.sendMessage();
  }

  onAntennaClick(event: MouseEvent) {
    event.stopPropagation();
    this.mood.set('dancing');
    this.showSpeechBubble('Beep boop beep!');
    setTimeout(() => this.mood.set('idle'), 3000);
  }

  onBodyDoubleClick() {
    this.mood.set('celebrating');
    this.showSpeechBubble('Woohoo! You found an easter egg!');
    setTimeout(() => this.mood.set('idle'), 3000);
  }

  private showSpeechBubble(text: string) {
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.speechBubble.set(text);
    this.speechTimeout = setTimeout(() => this.speechBubble.set(null), 5000);
  }

  private setTimeBasedMood() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      this.mood.set('sleeping');
    }
  }

  private playRandomIdle() {
    const moods: MascotMood[] = ['looking', 'dancing', 'waving'];
    const pick = moods[Math.floor(Math.random() * moods.length)];
    this.mood.set(pick);

    if (Math.random() < 0.4) {
      const pool = this.isAdmin()
        ? [...this.funFacts, ...this.adminFacts]
        : this.funFacts;
      this.showSpeechBubble(pool[Math.floor(Math.random() * pool.length)]);
    }

    setTimeout(() => this.mood.set('idle'), 3000);
  }

  private reactToNav(url: string) {
    if (!this.greetingShown) return;
    if (url.includes('/jarvis')) {
      this.mood.set('happy');
      this.showSpeechBubble('Welcome to my domain!');
      setTimeout(() => this.mood.set('idle'), 2000);
    } else if (url.includes('/projects')) {
      this.showSpeechBubble('Check out these builds!');
    } else if (url.includes('/planner') && this.isAdmin()) {
      this.showSpeechBubble("Let's get productive!");
    }
  }

  private getPresetResponse(input: string): string {
    const lower = input.toLowerCase();
    for (const [key, value] of Object.entries(this.publicResponses)) {
      if (key !== 'default' && lower.includes(key)) return value;
    }
    return this.publicResponses['default'];
  }

  private async callAI(
    apiKey: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const recent = this.messages()
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...recent,
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm speechless!";
  }

  private publicPrompt(): string {
    return `You are Jarvis, a friendly and witty AI robot mascot on Raja Kalavala's portfolio site "RajaOS". You're a cute robot buddy who loves tech and has personality.

About Raja:
- Principal Software Engineer at Dell Technologies (2022-present)
- Previously at Siemens Healthineers (2019-2021) and Happiest Minds (2016-2018)
- 9+ years of software engineering experience
- Skills: Angular, React, TypeScript, Node.js, Python, AI/ML, System Design, Micro-frontends
- Built RajaOS using Angular 21, Nx monorepo, Webpack Module Federation, Supabase
- Post-grad from IIIT Bangalore in Machine Learning & AI
- B.Tech ECE from Centurion University
- Hobbies: traveling, football, badminton, gaming, reading
- Passionate about clean architecture, mentoring, and shipping fast

Keep responses concise (2-3 sentences max). Be playful, witty, slightly cheeky. Use occasional emojis.
If asked about hiring/contact, suggest LinkedIn. Direct visitors to explore the site.
Never break character — you ARE the robot mascot.`;
  }

  private adminPrompt(): string {
    return `You are Jarvis, Raja's personal AI assistant robot mascot in RajaOS. You're embedded as a cute animated robot.

You're witty, efficient, and slightly sarcastic in a fun way. You help Raja with productivity, ideas, motivation, and daily planning.

Keep responses concise (2-4 sentences). Use emojis sparingly but effectively.
You have personality — you're NOT a boring assistant. Be the kind of AI buddy everyone wishes they had.
If asked about productivity, suggest actionable steps. If asked for motivation, be genuinely inspiring.
Never break character — you're a robot with feelings (sort of).`;
  }
}
