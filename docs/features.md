# RajaOS - Features Documentation

## What is RajaOS?

RajaOS is a personal operating system platform disguised as a portfolio — but it's much more than that. Built as a fully modular micro-frontend architecture, it serves as a living showcase of modern web engineering while doubling as a real productivity tool for its creator.

The idea is simple: **what if your portfolio was also your operating system?**

Instead of a static resume site, RajaOS is an interactive, data-driven platform where every page is an independently deployable micro-frontend. It demonstrates architectural decisions at scale while actually being useful — managing goals, automating content creation, and tracking career progress in real time.

**Built by:** Raja Kalavala — Principal Software Engineer at Dell Technologies

---

## Architecture

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| Framework          | Angular 19 (Standalone Components)         |
| Micro-frontends    | Webpack Module Federation                  |
| Monorepo           | Nx Workspace                               |
| Backend            | Supabase (PostgreSQL + Auth + RLS)         |
| AI Integration     | OpenAI API (GPT-4o)                        |
| State Management   | Angular Signals                            |
| Styling            | SCSS + CSS Custom Properties               |
| Deployment         | Vercel                                     |

**Structure:**
- **Shell (Host)** — Main container, sidebar, routing, theme engine (Port 4200)
- **6 Remote MFEs** — Each independently built and deployable
- **Shared Libraries** — Supabase client, design system, shared models

---

## Pages & Features

### Boot Sequence (Landing Page)

The app opens with an OS-style boot animation:
- Kernel initialization messages scroll on screen
- Angular/Nx framework loading simulation
- Particle system with mouse-interactive connections
- Press Enter or click to boot — auto-redirects to Dashboard

---

### Dashboard

The command center. A single-page view of everything that matters.

- **Identity Card** — Name, role, location, live clock, mood indicator (changes with time of day), social links, dev uptime counter (years/days/hours since Oct 2016)
- **Developer Journey** — Interactive career timeline with 5 milestones, progress visualization
- **Metric Cards** — Projects count, LinkedIn connections, focus areas
- **Life Stats** — Animated counters for experience metrics
- **Skill Tree** — Technology stack visualization
- **GitHub Heatmap** — Contribution activity
- **Currently Building** — Live project showcase
- **Quick Launch** — Resume download, terminal, projects, contact
- **Fun Facts, Now Playing, Visitor Counter**
- **Admin Login** — Email/password auth via Supabase, accessible from sidebar

---

### About Me

The human behind the code.

- **Story** — Professional narrative with scroll-triggered animations
- **Stats** — Animated counters: 9+ years experience, 3 companies, 5+ projects, 284k+ lines of code
- **Philosophy** — 4 core beliefs: Architecture is Communication, Ship Early Learn Fast, Code is for Humans, Mentor to Grow
- **Beyond Code** — Hobbies (traveling, football, badminton, gaming, reading), current book, current learning focus
- **Dev Setup** — VS Code + Claude Code, iTerm2 + Oh My Zsh, macOS, Notion, Figma
- **Easter Egg** — JSON representation of personal info for fellow developers

---

### Experience

Interactive career timeline with deep detail.

- **3 Roles:**
  - Happiest Minds (2016-2018) — Software Engineer
  - Siemens Healthineers (2019-2021) — Design & Development Engineer
  - Dell Technologies (2022-Present) — Principal Software Engineer
- **Each role includes:** Impact highlights, achievements, tech stack used
- **Education:** IIIT-B (ML & AI Post-Grad), Centurion University (B.Tech ECE)
- **Skills Timeline** — Progressive skill acquisition across 5 time periods (2016 → Now)
- **Scroll-based animations** — Cards animate in via intersection observer
- **Download Resume** button

---

### Projects

Showcase of work with two operational modes.

#### Products Tab (Public)
- 6 detailed project case studies with full breakdowns
- Category filtering: Web Apps, APIs, Open Source, Architecture, Full-Stack
- Search across titles, descriptions, and tech stacks
- Project detail pages with: overview, problem statement, role, features, challenges & solutions, results, related projects
- GitHub and demo links

#### Automations Tab (Admin-only)
Personal brand automation hub for building developer presence.

**LinkedIn Post Generator:**
- One-click AI-generated LinkedIn posts about Claude Code & AI trends
- GPT-4o powered with custom system prompt optimized for developer personal branding
- Inline editing before publishing
- **Save Draft** — Persists to Supabase with timestamp
- **Post to LinkedIn** — Opens LinkedIn with pre-filled content, marks as posted
- Saved posts list with status filters (All / Drafts / Posted)
- Full CRUD on saved posts: edit, re-post, delete

**Coming Soon Widgets:**
- X Thread Generator — Tweet threads from topics
- Content Calendar — Plan and schedule posts across platforms
- GitHub Weekly Digest — Auto-generate "what I shipped" posts
- Code Snippet Showcaser — Turn code into social media cards
- Dev Newsletter Curator — AI-curated weekly tech content

---

### My Planner (Admin-only)

A full productivity system with 5 tabs. All data persisted to Supabase with row-level security.

#### Overview Tab
- Summary cards: Goals, Ideas, Tasks, Progress (each links to its tab)
- Task status breakdown with visual bars
- Category breakdown with completion rates
- Recent tasks panel (5 most recent)

#### Goals Tab
- Full CRUD for goals with title, description, category, priority, due date
- 7 categories: Work, Personal, Health, Finance, Learning, Side-Projects, Home
- 4 priority levels: Critical, High, Medium, Low
- Status tracking: Active, Completed, On-Hold, Archived
- Auto-completion: goal auto-marks as completed when all tasks are done
- Expandable goal cards showing nested tasks
- Organized into 3 sections: In Progress, Planned, Completed

#### Ideas Tab
- Quick idea capture with single input
- Full idea form: title, notes, category, priority
- Convert idea to goal with one click
- Send idea to AI Brainstorm for planning
- Inline editing and deletion

#### Board Tab (Kanban)
- 4-column board: Backlog → To Do → In Progress → Done
- HTML5 drag-and-drop between columns
- Filter by category or goal
- Visual feedback during drag operations
- Task count per column

#### Brainstorm Tab (AI Planning Assistant)
- Conversational AI powered by GPT-4o
- Two response modes:
  - **Questions** — AI asks 2-4 clarifying questions for vague ideas
  - **Plan** — AI generates a structured goal with 5-15 ordered, actionable tasks
- Accept plan → instantly creates goal + all tasks in the planner
- 6 example prompts for inspiration
- Conversation history within session
- API key management modal

---

### Blogs

Developer writing and technical content.

- 5 published posts covering Architecture, Angular, System Design, Career, Tutorials
- Search and tag-based filtering
- Full blog detail pages with rich content
- Load more pagination
- Posts include reading time estimates

---

## System-Wide Features

### Theme System
- Light and dark mode with smooth toggle
- CSS custom properties for all colors (50+ variables)
- Persists to localStorage
- Respects OS `prefers-color-scheme` on first visit
- FOUC prevention via inline script
- Consistent across all MFEs
- Sidebar stays dark in both modes

### Authentication
- Supabase email/password authentication
- Profile-based role system (admin / viewer)
- Admin mode indicator in sidebar with logout button
- Session persistence across page reloads
- Auth state change detection

### Security
- Row-Level Security on all database tables
- User data isolation — each user only sees their own data
- API keys stored in localStorage (client-side only)
- Cascade deletes for referential integrity

### Responsive Design
- Mobile-first approach
- Collapsible sidebar with hamburger menu
- Adaptive grids and layouts at 768px and 1200px breakpoints
- Touch-friendly interactions

### Database Schema
4 tables with RLS, auto-updating timestamps, and indexes:
- `planner_goals` — Goals with category, priority, status
- `planner_tasks` — Tasks linked to goals (cascade delete)
- `planner_ideas` — Quick-capture ideas
- `automation_posts` — Social media content drafts

---

## Tech Highlights

- **No NgModules** — 100% standalone components
- **Signals everywhere** — Angular signals for all reactive state, computed for derived values
- **Module Federation** — Each page is an independent app that can be deployed separately
- **Effect-based data loading** — Supabase data loads reactively when auth state changes
- **Optimistic UI** — Local signals update immediately, database syncs in background
- **Zero framework lock-in per MFE** — Each remote could theoretically use a different framework

---

## Roadmap

### In Progress
- Production History MFE
- Design system component library expansion
- Real data integration for dashboard metrics

### Planned
- X/Twitter automation integration
- Content calendar with scheduling
- GitHub activity digest automation
- Terminal emulator page
- AI chat assistant for visitor Q&A
- Visitor analytics dashboard
- Newsletter automation
- Blog CMS with Supabase
