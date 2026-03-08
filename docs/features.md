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
| Framework          | Angular 21 (Standalone Components)         |
| Micro-frontends    | Webpack Module Federation                  |
| Monorepo           | Nx Workspace                               |
| Backend            | Supabase (PostgreSQL + Auth + RLS)         |
| AI Integration     | OpenAI API (GPT-4o)                        |
| State Management   | Angular Signals                            |
| Styling            | SCSS + CSS Custom Properties               |
| Deployment         | Vercel                                     |

**Structure:**
- **Shell (Host)** — Main container, sidebar, routing, theme engine, global overlays (Port 4200)
- **7 Remote MFEs** — Each independently built and deployable
- **Shared Libraries** — Supabase client, Jarvis AI services, design system, shared models

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

### Jarvis — AI Intelligence Layer (Admin-only)

A personal AI operating system built into RajaOS. Jarvis acts as an intelligent assistant that understands your goals, habits, and productivity patterns. Accessible from the sidebar (admin-only) and via global shortcuts. All data persisted to Supabase with row-level security.

**Architecture:** Dedicated MFE (`apps/mfe/jarvis/`, Port 4208) with shared library (`libs/shared/jarvis/`) containing models, services, and AI prompts. Sub-navigation within Jarvis routes to 8 pages.

#### Home
- Central hub with quick-access cards to all Jarvis features
- Quick stats: memories stored, focus sessions this week, best habit streak, overall score

#### Morning Briefing
- Terminal-style UI with red/yellow/green window dots
- Auto-shows once per day on admin login (via shell overlay)
- AI-generated daily briefing with top priority and Jarvis insight
- Powered by GPT-4o with context from your goals, tasks, and habits
- Start Day / Regenerate actions
- Stored in `jarvis_briefings` table with unique constraint per user/date

#### Chat with Jarvis
- Conversational AI with persistent message history
- Context-aware: Jarvis knows your goals, tasks, habits, and memories
- Quick prompt suggestions for common queries
- User/AI avatars with timestamps
- Auto-scroll, Enter to send (Shift+Enter for newline)
- Clear chat functionality
- Automatic memory extraction from conversations

#### Focus Session Manager
- Three-phase flow: **Setup → Active Timer → Reflection**
- **Setup:** Task description, optional goal linking, duration presets (25/45/90 min) or custom
- **Active:** Large countdown timer (MM:SS or HH:MM:SS), pause/resume, end session, daily stats
- **Reflection:** Completion notes, blockers, focus rating (1-5 stars)
- Sessions saved to `jarvis_focus_sessions` with duration tracking

#### Quick Capture
- Brain-dump input with Cmd/Ctrl+Enter to submit
- AI classification: determines type (idea/task/goal/note/reminder) and category
- Classification result with type/category badges and AI summary
- Route to planner or dismiss
- Filter tabs: All / Pending / Routed
- Capture history list
- **Global shortcut:** Cmd+Shift+J opens capture modal from anywhere in the app (shell-level overlay)

#### Life Metrics Dashboard
- 6 life score categories: Work, Health, Learning, Side Project, Finance, Personal Brand
- Each score has: progress bar (color-coded), trend indicator, status note (On track / Needs attention / Critical)
- Scores calculated from live Supabase data (task completion, habits, posts, focus sessions)
- Overall "RAJA OS SCORE" out of 100
- Save weekly snapshot to `jarvis_metrics_snapshots`

#### Weekly Review
- Terminal-style review generator
- AI analyzes your past week and produces: Shipped, Wins, Missed/Behind, Challenges, AI Reflection
- LinkedIn post draft generation from review data
- Copy LinkedIn Post button
- Save review to `jarvis_weekly_reviews`
- Week number and year tracking

#### Memory Manager
- CRUD interface for Jarvis's persistent memory
- 5 memory types: Context, Insight, Pattern, Preference, Decision (color-coded badges)
- 6 categories: Work, Health, Finance, Learning, Habits, Personal
- Filter by type and category
- Add manual memories with type/category selectors
- Relevance scoring and source tracking
- Jarvis auto-extracts memories from chat conversations

#### Habits Tab (in Planner)
- Integrated into the Planner MFE as a dedicated tab between Board and Brainstorm
- Habit checklist with toggle completion for today
- Streak tracking per habit (consecutive days)
- Add habit form: name, category, frequency (daily/weekdays/weekly), color, icon
- Edit and delete habits
- Completion count display
- Data stored in `jarvis_habits` and `jarvis_habit_logs` tables

#### Smart Nudges
- Notification bell in sidebar (admin-only) with unread count badge
- Nudge panel dropdown showing notifications with priority color dots
- Action buttons per nudge: navigate to relevant page, snooze (4h), dismiss
- Mark all as read on panel open
- 5 automatic trigger checks:
  - **Overdue Goals** — active goals past target date (high priority)
  - **Habit Streaks at Risk** — habits missed yesterday (medium)
  - **Weekly Review Due** — weekends with no review in 6+ days (medium)
  - **No Focus Session** — after 10 AM with none started (low)
  - **Aging Ideas** — ideas sitting 30+ days unactioned (low)
- Deduplication: max one nudge per type per day
- Data stored in `jarvis_nudges` table

#### Database Schema (10 tables)
All tables have RLS policies, indexes, and auto-updating timestamps:
- `jarvis_memories` — Persistent AI memory with type, category, relevance score
- `jarvis_briefings` — Daily morning briefings (unique per user/date)
- `jarvis_focus_sessions` — Deep work sessions with duration and ratings
- `jarvis_habits` — Habit definitions with frequency and color
- `jarvis_habit_logs` — Daily habit completion tracking (unique per user/habit/date)
- `jarvis_metrics_snapshots` — Weekly life score snapshots
- `jarvis_weekly_reviews` — Weekly review content and LinkedIn drafts
- `jarvis_captures` — Quick capture items with AI classification
- `jarvis_chat_sessions` — Persistent chat message history
- `jarvis_nudges` — Smart notification nudges with priority and snooze

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
14 tables with RLS, auto-updating timestamps, and indexes:
- `planner_goals` — Goals with category, priority, status
- `planner_tasks` — Tasks linked to goals (cascade delete)
- `planner_ideas` — Quick-capture ideas
- `automation_posts` — Social media content drafts
- `jarvis_memories` — AI persistent memory
- `jarvis_briefings` — Daily morning briefings
- `jarvis_focus_sessions` — Deep work session tracking
- `jarvis_habits` — Habit definitions
- `jarvis_habit_logs` — Daily habit completions
- `jarvis_metrics_snapshots` — Weekly life score data
- `jarvis_weekly_reviews` — Weekly review content
- `jarvis_captures` — Quick capture items
- `jarvis_chat_sessions` — Chat message history
- `jarvis_nudges` — Smart notifications

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
