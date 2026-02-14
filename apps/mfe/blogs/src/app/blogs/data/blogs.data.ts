import { BlogPost } from '../models/blog.model';

export const BLOGS_DATA: BlogPost[] = [
  {
    id: 1,
    slug: 'why-i-built-my-portfolio-as-an-operating-system',
    title: 'Why I Built My Portfolio as an Operating System',
    excerpt:
      'Traditional portfolios are boring. I wanted to create something that showcases not just my work, but my thinking about software architecture and user experience.',
    date: '2025-01-15',
    readingTime: '8 min read',
    tags: ['Architecture', 'Career'],
    content: `
## The Problem with Traditional Portfolios

Every developer portfolio looks the same. A hero section with a catchy tagline, a grid of project cards, maybe a skills section with progress bars (that mean nothing), and a contact form. Don't get me wrong—there's nothing *wrong* with this formula. It works. But I wanted something different.

> "Your portfolio should be a demonstration of your craft, not just a description of it."

When I started planning my new portfolio, I asked myself: **What would actually impress me if I were hiring a developer?**

The answer wasn't fancy animations or trendy gradients. It was seeing how someone thinks—their approach to architecture, their attention to detail, their ability to build systems that scale.

## The Operating System Metaphor

The idea came to me while debugging a microfrontend issue at work. I was thinking about how operating systems manage multiple applications—isolation, shared resources, communication protocols—and it clicked.

What if my portfolio *was* an operating system?

### Benefits of This Approach

1. **Natural navigation** - Users already know how to use an OS
2. **Modularity** - Each "app" can be developed independently
3. **Scalability** - Adding new sections is just adding new apps
4. **Demonstration of skills** - The portfolio itself shows what I can build

## Technical Implementation

I chose Angular with Module Federation for several reasons:

\`\`\`typescript
// module-federation.config.ts
const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['dashboard', 'http://localhost:4202/mf-manifest.json'],
    ['experience', 'http://localhost:4203/mf-manifest.json'],
    ['projects', 'http://localhost:4205/mf-manifest.json'],
  ],
};
\`\`\`

Each page is a **separate application** that gets loaded on demand. This means:

- **Independent deployments** - I can update one page without touching others
- **Optimized loading** - Users only download what they need
- **Real-world architecture** - This is exactly how enterprise apps are built

### The Shell Application

The shell acts as the host, providing:

- Global navigation (the sidebar)
- Theme management
- Shared design system tokens
- Route orchestration

\`\`\`typescript
// Theme management with signals
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'raja-os-theme';

  isDarkMode = signal<boolean>(this.getInitialTheme());

  toggleTheme(): void {
    this.isDarkMode.update(dark => !dark);
    this.applyTheme();
  }
}
\`\`\`

## Lessons Learned

Building this portfolio taught me several things:

### 1. Module Federation is Powerful but Complex

Getting shared dependencies right took more time than expected. Angular's dependency injection and Module Federation's singleton sharing can conflict if not configured carefully.

### 2. Design Systems Pay Off

I built a small design system with CSS custom properties for theming. This single decision saved me *hours* of work when implementing dark mode.

\`\`\`scss
// All colors use CSS variables
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
}
\`\`\`

### 3. Content is Still King

All the fancy architecture in the world doesn't matter if the content isn't good. I spent as much time writing copy and curating projects as I did coding.

## What's Next?

This portfolio is a living project. I'm planning to add:

- **Terminal emulator** - A working bash-like interface
- **AI chat assistant** - Ask questions about my experience
- **Analytics dashboard** - Real-time visitor stats
- **Blog integration** - You're reading it!

## Conclusion

Building your portfolio as a demonstration of your skills rather than just a list of them creates a more compelling case for your abilities. It shows potential employers or clients not just *what* you've done, but *how* you think.

If you're a developer looking to stand out, consider: what unique spin can you put on your portfolio that reflects your specific expertise?

---

*Have questions about the implementation? Feel free to reach out or check out the source code on GitHub.*
`,
  },
  {
    id: 2,
    slug: 'microfrontend-architecture-angular-nx',
    title: 'Microfrontend Architecture with Angular and Nx',
    excerpt:
      'A deep dive into building scalable microfrontend applications using Angular, Nx workspace, and Module Federation. Real patterns from production.',
    date: '2025-01-08',
    readingTime: '12 min read',
    tags: ['Architecture', 'Angular', 'Tutorial'],
    content: `
## Introduction

Microfrontends have moved from experimental to mainstream. In this post, I'll share patterns we've used in production to scale our Angular applications to multiple teams.

## Why Microfrontends?

When your frontend grows beyond a certain size, you face familiar problems:

- **Build times** become unbearable
- **Team coordination** becomes a bottleneck
- **Deployments** become risky
- **Code ownership** becomes unclear

Microfrontends solve these by splitting your application into smaller, independently deployable pieces.

## The Nx + Module Federation Stack

\`\`\`bash
npx create-nx-workspace@latest my-org --preset=empty
cd my-org
npx nx g @nx/angular:host shell
npx nx g @nx/angular:remote dashboard
\`\`\`

This creates a host application (shell) and a remote (dashboard) that can be developed and deployed independently.

## Key Patterns

### 1. Shared Libraries

Create shared libraries for common code:

\`\`\`typescript
// libs/shared/ui/src/lib/button/button.component.ts
@Component({
  selector: 'shared-button',
  template: \`<button [class]="variant"><ng-content></ng-content></button>\`,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
}
\`\`\`

### 2. State Management Boundaries

Each microfrontend manages its own state. Cross-MFE communication happens through:

- URL parameters
- Custom events
- Shared services (sparingly)

### 3. Consistent Styling

Use CSS custom properties for theming across MFEs:

\`\`\`scss
:root {
  --brand-primary: #22c55e;
  --bg-surface: #ffffff;
}
\`\`\`

## Conclusion

Microfrontends aren't for every project, but for large-scale applications with multiple teams, they're invaluable.
`,
  },
  {
    id: 3,
    slug: 'junior-to-principal-architect-mindset-shifts',
    title: 'From Junior Dev to Principal Architect: 5 Mindset Shifts',
    excerpt:
      'The technical skills got me in the door. The mindset shifts got me to principal. Here are the five biggest changes in how I think about software.',
    date: '2024-12-20',
    readingTime: '10 min read',
    tags: ['Career'],
    content: `
## Introduction

Nine years ago, I wrote my first line of production code. Today, I'm a Principal Software Architect. The technical skills I've learned are important, but they're not what got me here. The mindset shifts were more important.

## Shift 1: From "How" to "Why"

**Junior**: "How do I implement this feature?"
**Principal**: "Why are we building this? What problem does it solve? Is it the right problem to solve?"

Early in my career, I was a solution machine. Give me a problem, I'll code it. But I never questioned whether we were solving the right problem.

## Shift 2: From Local to System-Wide Thinking

When you're junior, your scope is your ticket. When you're senior, your scope is the system.

> "Every line of code you write is a liability. Every line you don't write is an asset."

## Shift 3: From Building to Enabling

The best architects don't build everything themselves. They create environments where others can build great things.

This means:
- Writing documentation
- Creating reusable abstractions
- Mentoring team members
- Making decisions that enable autonomy

## Shift 4: From Certainty to Probability

Junior devs want THE answer. Senior devs understand there are trade-offs.

\`\`\`
There is no "best" database.
There is no "best" framework.
There is only: best for THIS context, with THESE constraints.
\`\`\`

## Shift 5: From Execution to Communication

Writing code is maybe 30% of a principal architect's job. The rest is:

- Explaining complex concepts simply
- Building consensus
- Writing ADRs and documentation
- Presenting to stakeholders

## Conclusion

Technical skills are table stakes. The mindset shifts are what separate good developers from great architects.
`,
  },
  {
    id: 4,
    slug: 'angular-signals-in-production',
    title: 'Angular Signals in Production: Lessons from 6 Months',
    excerpt:
      'We migrated a large Angular application to signals. Here is what worked, what did not, and what I wish I knew before starting.',
    date: '2024-12-05',
    readingTime: '9 min read',
    tags: ['Angular', 'Tutorial'],
    content: `
## Introduction

Six months ago, we started migrating our Angular application from RxJS-heavy patterns to signals. Here's our honest assessment.

## What Are Signals?

Signals are Angular's new primitive for reactive state management:

\`\`\`typescript
// Creating a signal
const count = signal(0);

// Reading a signal
console.log(count()); // 0

// Updating a signal
count.set(1);
count.update(c => c + 1);

// Computed signals
const doubled = computed(() => count() * 2);
\`\`\`

## What Worked Well

### 1. Simpler Component State

Before:
\`\`\`typescript
@Component({...})
export class UserComponent implements OnInit, OnDestroy {
  user$ = new BehaviorSubject<User | null>(null);
  loading$ = new BehaviorSubject<boolean>(true);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user$.next(user);
        this.loading$.next(false);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
\`\`\`

After:
\`\`\`typescript
@Component({...})
export class UserComponent {
  user = signal<User | null>(null);
  loading = signal(true);

  constructor() {
    this.userService.getUser().subscribe(user => {
      this.user.set(user);
      this.loading.set(false);
    });
  }
}
\`\`\`

### 2. Better Performance

Signals enable fine-grained reactivity. Only components that depend on changed signals re-render.

### 3. Easier Mental Model

New team members picked up signals much faster than RxJS patterns.

## What Didn't Work

### 1. Integration with RxJS Libraries

Many Angular libraries still return Observables. You'll need \`toSignal()\` adapters.

### 2. Complex Async Flows

For complex async orchestration (retry, debounce, race conditions), RxJS is still better.

## Conclusion

Signals are great for component state. RxJS is still valuable for complex async flows. Use both where appropriate.
`,
  },
  {
    id: 5,
    slug: 'architecture-decision-records-i-wish-id-written',
    title: "The Architecture Decision Records I Wish I'd Written Earlier",
    excerpt:
      'ADRs are the most underrated documentation practice. Three decisions I should have documented and the consequences of not doing so.',
    date: '2024-11-18',
    readingTime: '7 min read',
    tags: ['Architecture', 'System Design'],
    content: `
## What is an ADR?

An Architecture Decision Record (ADR) captures a significant architectural decision along with its context and consequences.

\`\`\`markdown
# ADR 001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need a database for our user data. Options considered:
- PostgreSQL
- MongoDB
- MySQL

## Decision
We will use PostgreSQL.

## Consequences
- Need team training on PostgreSQL
- Can leverage JSONB for semi-structured data
- Strong ACID compliance
\`\`\`

## The Three ADRs I Should Have Written

### 1. "Why We Chose Microservices"

We moved to microservices without documenting why. Two years later, new team members asked "why not a monolith?" and nobody remembered the original reasoning.

### 2. "Authentication Strategy"

We implemented JWT without documenting the alternatives considered. When we hit scaling issues, we had to re-research all options.

### 3. "API Versioning Approach"

We chose URL versioning (/v1/, /v2/) without documenting the trade-offs against header versioning. This caused confusion during our first breaking change.

## How to Write Good ADRs

1. **Write them at decision time** - Not after
2. **Include rejected alternatives** - Future you will want to know
3. **Keep them short** - One page maximum
4. **Make them findable** - Store in the repo, not Confluence

## Conclusion

ADRs take 15 minutes to write and save hours of confusion later. Start writing them today.
`,
  },
];
