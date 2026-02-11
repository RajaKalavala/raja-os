# Raja OS v1.0 — Claude Code Implementation Guide

## 🎯 How to Use This Guide

### Strategy: Incremental Prompts, Not One Giant Prompt

Claude Code works best when you break work into **focused, sequential prompts** rather than dumping everything at once. Here's why:

1. **Context window** — One massive prompt leaves less room for Claude Code to think and generate code
2. **Quality** — Smaller, focused tasks produce better code than trying to do everything at once
3. **Debugging** — If something breaks, you know exactly which step caused it
4. **Iteration** — You can review and adjust after each step before moving on

### How to Feed This to Claude Code

1. **Start a new Claude Code session** for each major phase
2. **Copy-paste each prompt below** one at a time, in order
3. **Review the output** before moving to the next prompt
4. **If something fails**, ask Claude Code to fix it before proceeding
5. **Use `CLAUDE.md`** — Create a CLAUDE.md file in your project root (Prompt 0 below does this) so Claude Code always has project context

### Tips for Best Results with Claude Code

- Always let the current prompt finish completely before giving the next one
- If Claude Code asks clarifying questions, answer them — don't skip ahead
- After each phase, run the app (`nx serve shell`) to verify it works
- If you hit errors, paste the error message and ask Claude Code to fix it
- You can always say "show me the current file structure" to verify state
- Use `claude --resume` to continue a session if it disconnects

---

## Prompt 0: Project Memory File (CLAUDE.md)

> **Do this first!** Create a `CLAUDE.md` file in your project root. Claude Code reads this automatically at the start of every session, giving it persistent context about your project.

Create a file called `CLAUDE.md` in your project root directory manually (or ask Claude Code to create it) with this content:

```markdown
# Raja OS v1.0

## Project Overview
Raja OS is a futuristic OS-themed portfolio website for a Full-Stack Developer. It presents a desktop operating system experience with draggable/resizable windows, a taskbar, boot animation, interactive terminal, and hidden Easter egg game.

## Architecture
- **Monorepo:** Nx Workspace
- **Framework:** Angular 17+ with Signals
- **Microfrontends:** Webpack Module Federation (host/remote pattern)
- **Styling:** Tailwind CSS + custom design tokens (CSS custom properties)
- **State Management:** Angular Signals + injectable services (NO NgRx)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Deployment:** Vercel

## Color Palette (Futuristic Dark Theme)
- Background Primary: #0A0E17
- Background Secondary: #0F1923
- Background Elevated: #162032
- Accent Primary (Cyan): #00D4FF
- Accent Secondary (Purple): #7B2FBE
- Accent Gradient: linear-gradient(135deg, #00D4FF, #7B2FBE)
- Text Primary: #E8F0F8
- Text Secondary: #8899AA
- Success: #00FF88
- Warning: #FFB800
- Error: #FF3366
- Glass BG: rgba(15, 25, 35, 0.7)
- Glass Border: rgba(0, 212, 255, 0.15)

## Typography
- UI Font: Inter
- Code/Terminal Font: JetBrains Mono
- Widget Data: JetBrains Mono (bold, larger)

## Nx Workspace Structure
```
raja-os/
├── apps/
│   ├── shell/              # Host — OS chrome, taskbar, window manager, routing
│   ├── dashboard/          # Remote — widget-based home screen
│   ├── projects/           # Remote — portfolio showcase
│   ├── blog/               # Remote — articles with Markdown rendering
│   ├── terminal/           # Remote — interactive CLI
│   ├── contact/            # Remote — mail-themed contact form
│   └── space-invaders/     # Remote — Easter egg game (lazy loaded)
├── libs/
│   ├── shared/ui/          # Design system components
│   ├── shared/theme/       # Tailwind config + design tokens
│   ├── shared/window-manager/  # Window drag/resize/z-index service
│   ├── shared/models/      # TypeScript interfaces and types
│   ├── shared/data-access/ # Supabase client and API services
│   └── shared/utils/       # Helpers, animations, constants
├── CLAUDE.md               # This file
├── nx.json
├── package.json
└── tailwind.config.js
```

## Key Conventions
- All components use standalone Angular components (no NgModules where possible)
- Use Angular Signals for reactive state, not RxJS Subjects (RxJS is fine for HTTP/async)
- Every shared UI component should be in libs/shared/ui/
- Window management logic lives in libs/shared/window-manager/
- Supabase client is initialized in libs/shared/data-access/
- Tailwind classes are preferred over custom CSS; use design tokens via CSS custom properties
- All animations use CSS transitions/keyframes or Angular's animation API
- Mobile breakpoint: 768px — below this, the OS metaphor is dropped for standard responsive layout

## Commands
- `nx serve shell` — Run the shell (host) app in dev mode
- `nx serve dashboard` — Run dashboard standalone
- `nx build shell --configuration=production` — Production build
- `nx affected --target=build` — Build only changed apps
- `nx graph` — Visualize dependency graph
```

---

## Phase 1: Foundation & Workspace Setup

### Prompt 1.1 — Initialize Nx Workspace with Angular + Module Federation

```
Initialize an Nx workspace for the "Raja OS" project with the following setup:

1. Create a new Nx workspace using Angular preset with pnpm as package manager
2. Install and configure @nx/angular and @angular-architects/module-federation
3. Create the Shell app as the Module Federation HOST:
   - apps/shell — the main host application
   - Configure webpack.config.js for Module Federation host with remotes: dashboard, projects, blog, terminal, contact
4. Create these REMOTE apps with Module Federation:
   - apps/dashboard
   - apps/projects  
   - apps/blog
   - apps/terminal
   - apps/contact
5. Each remote should expose a single RemoteEntryModule
6. Configure shared dependencies as singletons: @angular/core, @angular/common, @angular/router
7. Set up routing in the shell that lazy-loads each remote via loadRemoteModule()

For now, each remote app should just render a simple placeholder component that says its name (e.g., "Dashboard App", "Projects App", etc.).

Make sure `nx serve shell` works and can load each remote app.

Use Angular 17+ with standalone components wherever possible.
```

### Prompt 1.2 — Create Shared Libraries

```
Create the following shared Nx libraries for Raja OS:

1. **libs/shared/ui** — Shared UI component library
   - Create these standalone components with placeholder implementations:
     - GlassPanelComponent — A container with glassmorphism styling (backdrop-filter: blur, semi-transparent bg, gradient border)
     - OsButtonComponent — Styled button with variants: primary (cyan), secondary (purple), ghost
     - GradientBorderComponent — A wrapper that adds the cyan-to-purple gradient border
     - LoadingSpinnerComponent — A futuristic loading spinner/ring animation
   
2. **libs/shared/theme** — Theme and design tokens
   - Create a tailwind.preset.js that extends the default Tailwind config with our custom colors, fonts, and spacing
   - Create a tokens.css file with all CSS custom properties (see CLAUDE.md for the color palette)
   - Make sure all apps import this preset in their tailwind configs

3. **libs/shared/models** — TypeScript interfaces
   - Create interfaces: OsWindow, OsApp, Project, BlogPost, ContactMessage, ProfileConfig, Widget, TerminalCommand
   - Create enums: WindowState (NORMAL, MINIMIZED, MAXIMIZED), AppId

4. **libs/shared/window-manager** — Window management service
   - Create WindowManagerService using Angular Signals
   - It should manage: open windows (Signal<OsWindow[]>), active window ID, z-index stack
   - Methods: openWindow(), closeWindow(), minimizeWindow(), maximizeWindow(), bringToFront(), updatePosition(), updateSize()
   
5. **libs/shared/data-access** — Supabase client
   - Install @supabase/supabase-js
   - Create a SupabaseService that initializes the client with environment variables
   - Create placeholder services: ProjectsService, BlogService, ContactService, ProfileService

6. **libs/shared/utils** — Utilities
   - Animation utility functions
   - Constants (app definitions, terminal commands list)

Configure all libraries to be buildable and importable via @raja-os/shared/* path aliases.
```

### Prompt 1.3 — Install and Configure Tailwind CSS

```
Set up Tailwind CSS across the entire Raja OS Nx workspace:

1. Install Tailwind CSS, PostCSS, and Autoprefixer
2. Create a root tailwind.config.js that uses the preset from libs/shared/theme
3. Configure each app (shell, dashboard, projects, blog, terminal, contact) to use Tailwind
4. The Tailwind config should include:
   - Custom colors matching our design tokens:
     - os-bg: { primary: '#0A0E17', secondary: '#0F1923', elevated: '#162032' }
     - os-accent: { primary: '#00D4FF', secondary: '#7B2FBE' }
     - os-text: { primary: '#E8F0F8', secondary: '#8899AA' }
     - os-success: '#00FF88', os-warning: '#FFB800', os-error: '#FF3366'
   - Custom fonts: { sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] }
   - Custom backdrop-blur values for glassmorphism
   - Custom box-shadow for neon glow effects:
     - glow-cyan: '0 0 20px rgba(0, 212, 255, 0.3)'
     - glow-purple: '0 0 20px rgba(123, 47, 190, 0.3)'
   - Custom animation utilities for window open/close, fade-in, slide-up
5. Add Inter and JetBrains Mono Google Fonts to the shell's index.html
6. Set the global body background to #0A0E17 and default text to #E8F0F8
7. Make sure `nx serve shell` still works with Tailwind classes rendering correctly

Test by adding some Tailwind classes with our custom tokens to the shell component to verify everything works.
```

---

## Phase 2: Shell Application (The OS Chrome)

### Prompt 2.1 — Desktop & Taskbar

```
Build the Shell application's desktop environment for Raja OS:

## Desktop Component
- Full viewport background with color #0A0E17
- Optional: Add a very subtle CSS gradient mesh or radial gradient in the background for depth (not a flat color)
- This is the main container where windows will be rendered
- It should listen for clicks on the empty desktop to deselect active windows

## Taskbar Component
Create a fixed taskbar at the bottom of the screen (like a dock):

- **Height:** 60px
- **Style:** Glassmorphism — semi-transparent dark background with backdrop-blur, subtle top border with the cyan accent
- **Left section:** 
  - Raja OS logo text (styled, small)
  - Digital clock showing current time (updates every second), styled in JetBrains Mono
- **Center section:**
  - 5 app icons in a row: Dashboard, Projects, Blog, Terminal, Contact
  - Each icon should be an SVG or emoji icon inside a 44px circle
  - Active app has a small cyan dot below the icon
  - Hover effect: slight scale-up + glow
  - Clicking opens the app (calls WindowManagerService.openWindow())
- **Right section:**
  - A notification bell icon (non-functional for now, just visual)
  - A settings gear icon (non-functional for now)

The taskbar should show minimized windows as highlighted icons.

## Window Rendering
- The desktop component should iterate over the WindowManagerService's open windows signal
- For each open window, render a WindowContainerComponent that:
  - Has a title bar with: app icon, app name, minimize/maximize/close buttons
  - Title bar buttons: minimize (—), maximize (□), close (×) styled with hover effects
  - The window body loads the corresponding remote microfrontend via loadRemoteModule()
  - Window has a glassmorphism border and subtle shadow
  - Default window size: 80% viewport width, 75% viewport height, centered
  - Windows that are MINIMIZED should not be visible (hidden, not destroyed)
  - The active/focused window should have a brighter border glow

Make sure clicking between windows brings the clicked one to front (z-index management).
Don't implement drag/resize yet — just get the visual layout and open/close/minimize/maximize working.
```

### Prompt 2.2 — Window Drag & Resize

```
Add drag and resize functionality to the WindowContainerComponent in Raja OS:

## Dragging
- Users can drag windows by clicking and holding the title bar
- While dragging, the window should move smoothly with the cursor
- The window should stay within the viewport bounds (can't be dragged off-screen)
- While dragging, add a subtle opacity reduction (0.9) for visual feedback
- On drag end, snap the window to its new position

## Resizing
- Add a resize handle in the bottom-right corner of each window (a small diagonal grip icon)
- Users can click and drag this handle to resize the window
- Minimum size: 400px width, 300px height
- Maximum size: viewport dimensions
- While resizing, show the current dimensions as a small tooltip

## Snap Zones (optional enhancement)
- Dragging a window to the left edge snaps it to the left half of the screen
- Dragging to the right edge snaps to the right half
- Dragging to the top edge maximizes the window
- Show a subtle blue overlay when hovering near snap zones

## Double-click
- Double-clicking the title bar toggles between maximized and normal state

## Implementation Notes
- Use Angular CDK DragDrop or implement custom directives with mousedown/mousemove/mouseup
- Update the WindowManagerService signals with new position/size on each change
- Make sure z-index is updated when a window starts being dragged (bring to front)
- All window state (position, size) should persist in the WindowManagerService so windows remember their position after minimize/restore

Test with multiple windows open, dragging them around, and resizing. Make sure z-index ordering works correctly.
```

### Prompt 2.3 — Boot-Up Animation

```
Create a cinematic boot-up animation for Raja OS that plays when the site first loads:

## Component: BootSequenceComponent
This is a full-screen overlay that plays on first visit, then reveals the desktop.

### Phase 1 — BIOS/POST (0-1.5s)
- Black screen (#000000)
- Green monospace text (JetBrains Mono, #00FF88) types out line by line with a typewriter effect:
  - "Raja OS BIOS v1.0"
  - "Initializing system.............. OK"
  - "Loading modules: Angular, TypeScript, Node.js... OK"
  - "Skills database: [##########] 100%"  (the progress bar fills up animated)
  - "Projects synced: 12 repositories found"
  - "System ready."
- Each line appears with a 200ms delay after the previous line finishes typing
- Typing speed: ~30ms per character

### Phase 2 — Logo Reveal (1.5-3s)
- The terminal text fades out
- "RAJA OS" appears centered in large bold text (48px+)
- The text has a neon cyan glow effect that pulses once
- A subtle particle or line effect emanates from the text
- Below the logo: "v1.0" fades in with a slight delay

### Phase 3 — Desktop Transition (3-4.5s)
- The logo scales down slightly and fades out
- The desktop background fades in underneath
- The taskbar slides up from the bottom (translateY animation)
- A welcome notification slides in from the top-right: "Welcome to Raja OS v1.0"

### Skip Functionality
- Small "Skip ▸" text in the bottom-right corner, visible throughout
- Clicking it immediately jumps to the desktop (fast fade transition)
- Pressing any key also skips
- Use sessionStorage to skip on subsequent visits in the same session
- Use localStorage to let returning visitors bypass entirely (with a "showBootAnimation" flag)

### Technical Notes
- Use Angular's animation API or pure CSS keyframes
- The component should overlay everything (z-index: 9999, position: fixed)
- After completion, the component destroys itself (or sets display: none)
- Use requestAnimationFrame for smooth typing animation
- The boot sequence should preload critical assets in the background while it plays
```

---

## Phase 3: Dashboard App

### Prompt 3.1 — Dashboard Layout & Widget System

```
Build the Dashboard app for Raja OS — the widget-based home screen:

## Dashboard Layout
- CSS Grid layout that supports widgets in 3 sizes:
  - Small: 1 column span (1x1)
  - Medium: 2 column span (2x1)
  - Large: 2 column span, 2 row span (2x2)
- 4-column grid on desktop, responsive down to 1 column
- Grid gap: 16px
- Each widget sits inside a GlassPanelComponent from the shared UI library
- Every widget has: a small title bar (widget name + optional icon), and a content area

## Implement These Widgets:

### 1. Profile Card (Large — 2x2)
- Circular avatar placeholder (use a gradient circle with initials for now)
- Name: "[Your Name]" (large, bold)
- Title: "Full-Stack Developer" 
- Tagline: "[Your tagline here]"
- Location + local time (auto-updating every second)
- Row of social link icons: GitHub, LinkedIn, Twitter/X, Email (use Lucide icons or SVGs)
- Status badge: "🟢 Open to Opportunities" with a subtle pulse animation on the green dot
- 2-line bio placeholder text

### 2. Tech Stack Radar (Medium — 2x1)
- Create a radar/spider chart showing 6 categories: Frontend, Backend, Database, DevOps, Mobile, Tools
- Each axis has a value from 0-100
- Use Chart.js with custom styling to match the dark theme (cyan lines, purple fill area, dark grid)
- Placeholder data for now
- Hovering on a point shows the category name and value

### 3. GitHub Activity (Medium — 2x1)
- A placeholder contribution heatmap (grid of small squares, like GitHub's)
- Use varying shades of cyan for intensity levels
- Below the heatmap: stats row — "XX Repos | XX Stars | XX Contributions"
- Latest commit: "Last commit: 'feat: add dashboard widgets' — 2 hours ago"
- All placeholder data for now (will connect to GitHub API later)

### 4. Currently Working On (Small — 1x1)
- Project name with a cyan accent
- 3-4 tech stack tags (small pills/badges)
- Circular progress indicator (e.g., 65%)
- Green pulsing dot with "In Progress" label

### 5. Blog Latest (Small — 1x1)
- Post title (truncated to 2 lines)
- Date and reading time
- "Read →" link
- Placeholder data

### 6. System Uptime (Small — 1x1)
- "Developer Uptime" title
- Large monospace counter: "XX years, XX months, XX days"
- Placeholder start date (will be configured later)
- Subtle tick animation every second

### 7. Quick Actions (Small — 1x1)
- 4 action buttons in a 2x2 grid:
  - 📄 Resume (download action)
  - 💻 Terminal (opens terminal app)
  - 🚀 Projects (opens projects app)
  - 📬 Contact (opens contact app)
- Each button has an icon + label, styled as small glass tiles

Use placeholder/mock data for everything. We'll connect to Supabase later.
```

---

## Phase 4: Projects App

### Prompt 4.1 — Projects Showcase

```
Build the Projects app for Raja OS:

## Project List View (default)
- Grid layout: 3 columns on large screens, 2 on medium, 1 on mobile
- Each project card (GlassPanelComponent):
  - Thumbnail image area (16:9 aspect ratio, use a gradient placeholder)
  - Project title (bold)
  - Short description (2 lines max, truncated)
  - Tech stack tags (small cyan pills, max 4 shown + "+X more")
  - Row: GitHub icon link + Live Demo icon link (if available)
  - "Featured" badge (small cyan/purple gradient pill) on featured projects
- Hover effect: card lifts slightly (translateY -4px), border glows cyan

## Filter & Search Bar (top of the app)
- Search input field (styled to match the OS theme — dark bg, cyan border on focus)
- Filter chips/buttons for categories: "All", "Web App", "Mobile", "Open Source", "Full-Stack", "Frontend"
- Active filter chip has cyan background
- Filter chips are scrollable horizontally on mobile

## Project Detail View
When a project card is clicked, transition to a detail view within the same window:
- Back button "← All Projects" at the top
- Hero image area (full width, placeholder gradient)
- Project title (large)
- Tech stack with larger icon/logo badges
- Full description (multiple paragraphs, placeholder Markdown text)
- Two action buttons: "View Live Demo" and "View on GitHub" (styled OsButtons)
- "Challenges & Solutions" section (placeholder)
- "Related Projects" section at the bottom (horizontal scroll of 3 mini cards)

## Routing
- /projects — list view
- /projects/:slug — detail view
- Use Angular Router within the remote app

## Data
Use hardcoded mock data for now — create an array of 6 sample projects with realistic-looking placeholder content (e.g., "E-Commerce Platform", "Real-Time Chat App", "Portfolio OS", "Task Management API", "Weather Dashboard", "Open Source CLI Tool"). Each with different tech stacks and categories.
```

---

## Phase 5: Blog App

### Prompt 5.1 — Blog Application

```
Build the Blog app for Raja OS:

## Blog List View (default)
- Vertical list of blog post cards (full width, not grid):
  - Post title (large, bold, white)
  - Excerpt (2-3 lines, secondary text color)
  - Meta row: date (formatted nicely) + reading time + tag pills
  - Subtle bottom border between posts
  - Hover: title turns cyan
- Tag filter bar at the top: clickable tag pills to filter posts
  - Tags like: "Angular", "TypeScript", "Architecture", "DevOps", "Career", "Tutorial"
- Search bar
- Pagination or "Load More" button at bottom

## Blog Post View
Clean reading experience when a post is clicked:
- Back button "← All Posts"
- Post title (very large, bold)
- Meta: date, reading time, tags
- Cover image area (placeholder)
- Article content area:
  - Max width 720px, centered within the window
  - Good typography: 18px body text, 1.8 line-height, Inter font
  - Support for: headings (h2, h3), paragraphs, bold/italic, code blocks, blockquotes, lists, images, links
  - Code blocks: syntax highlighted with a dark theme (use Prism.js or highlight.js), with a "Copy" button
  - Inline code should have a subtle dark background with cyan text
- Table of contents sidebar (fixed on the right for wider windows, hidden on narrow):
  - Auto-generated from h2/h3 headings
  - Clicking scrolls to that section
  - Active section highlighted
- Share buttons at the bottom: Copy Link, Twitter, LinkedIn
- Related posts section

## Content
Create 3 mock blog posts with realistic Markdown content:
1. "Building a Microfrontend Architecture with Angular and Nx" (tutorial style, with code blocks)
2. "Why I Built My Portfolio as an Operating System" (personal/creative, shorter)
3. "Angular Signals vs RxJS: When to Use What" (technical comparison)

Use a Markdown rendering library (marked + DOMPurify, or ngx-markdown) to render the content.

## Routing
- /blog — list view
- /blog/:slug — post view
```

---

## Phase 6: Terminal App

### Prompt 6.1 — Interactive Terminal

```
Build the Interactive Terminal app for Raja OS. This is the most unique feature — a working command-line interface where visitors type commands to explore the portfolio.

## Visual Design
- Background: #0A0E17 (darkest)
- Text color: #00D4FF (cyan) for normal output, #00FF88 (green) for success, #FF3366 for errors
- Font: JetBrains Mono, 14px
- Blinking cursor: cyan block cursor that blinks every 500ms
- Command prompt: `raja@os:~$ ` in green, user input in white
- Output text appears line by line (optional: with a fast typing animation, toggleable)
- Scrollable output area — auto-scrolls to bottom on new output

## Core Features
1. **Input handling:**
   - Text input at the bottom, always focused when terminal window is active
   - Enter key executes the command
   - Arrow Up/Down navigates command history
   - Tab key triggers auto-completion (match against available commands)
   
2. **Command history:**
   - Store all entered commands in an array
   - Arrow keys cycle through history

3. **ASCII Art Header:**
   - When terminal opens, show a stylized "RAJA OS TERMINAL v1.0" ASCII art header
   - Followed by: "Type 'help' to see available commands."

## Commands to Implement

| Command | Output |
|---------|--------|
| `help` | Formatted table of all commands with descriptions |
| `about` | Multi-line bio/about text with ASCII formatting |
| `skills` | Categorized skills with visual proficiency bars using ████░░ characters |
| `experience` | Work timeline with company, role, dates, bullets |
| `projects` | Table of projects: name, tech stack, links |
| `blog` | Recent blog posts: title, date |
| `contact` | Email, LinkedIn, GitHub with clickable links |
| `resume` | Triggers a file download (placeholder PDF for now) |
| `education` | Degrees and institutions |
| `social` | All social links |
| `github` | Repo count, stars, top languages (placeholder) |
| `theme [green/cyan/amber/matrix]` | Changes terminal text color |
| `clear` | Clears all output |
| `history` | Shows command history |
| `whoami` | Outputs "guest@raja-os" |
| `date` | Current date and time |
| `ls` | Lists "files": about.txt, resume.pdf, projects/, blog/, skills.json |
| `cat [filename]` | Shows content of virtual files (e.g., `cat about.txt` shows bio) |
| `cd [dir]` | Changes virtual directory, updates prompt path |
| `pwd` | Prints current virtual path |
| `echo [text]` | Echoes text back |
| `neofetch` | Shows ASCII art + system info panel (OS: Raja OS, Uptime: X years, Shell: Angular, Theme: Futuristic, etc.) |
| `sudo hire raja` | Fun Easter egg: "Access granted! Downloading resume..." + triggers download |
| `rm -rf /` | Humorous response: "Nice try! 🚫 Permission denied. This OS is protected by good vibes." |
| `game` | Outputs: "Launching Space Invaders: Bugs vs Code..." (will integrate later) |
| `matrix` | Shows matrix rain animation in the terminal for 5 seconds |
| `exit` | Closes the terminal window (calls WindowManagerService.closeWindow()) |
| Unknown command | "Command not found: [cmd]. Type 'help' for available commands." |

## Implementation
- Create a TerminalService that manages: command history, current directory (virtual), output buffer
- Each command is a function that returns string[] (output lines)
- The terminal component renders the output buffer and handles input
- Links in output should be clickable (detect URLs and wrap in <a> tags)
- The skills bars should look like: "Angular    ████████████░░░░ 85%"

Use placeholder data for all content. Make it feel like a REAL terminal.
```

---

## Phase 7: Contact App

### Prompt 7.1 — Contact Mail App

```
Build the Contact app for Raja OS, styled as a futuristic email client:

## Layout
Split-panel layout within the window:

### Left Sidebar (30% width)
- "Compose" button at the top (cyan accent, prominent)
- Navigation items styled like email folders:
  - 📥 Inbox (shows 3 placeholder received messages / testimonials)
  - 📤 Sent (empty initially, shows sent messages after form submission)
  - ⭐ Starred (non-functional, just visual)
- Each nav item has an icon and label
- Active item has cyan left border + subtle background highlight

### Main Content Area (70% width)

**When "Compose" is selected (default):**
- Email compose form styled to look like writing an email:
  - **To:** Pre-filled with "[Your Name] <your@email.com>" (disabled, styled as a chip)
  - **From:** Input field for visitor's name + email
  - **Subject:** Input field  
  - **Category:** Dropdown select — "Job Opportunity", "Collaboration", "Feedback", "Just Saying Hi", "Other"
  - **Message:** Large textarea
  - **Send button:** Styled as OsButton primary, with a paper plane icon
- Form validation:
  - All fields required
  - Email format validation
  - Minimum message length: 10 characters
  - Show inline error messages in the error color (#FF3366)

**When "Inbox" is selected:**
- List of placeholder messages (testimonials/recommendations):
  - 3 hardcoded messages with sender name, subject, preview text, date
  - Clicking a message shows the full message in the main area

**On successful submit:**
- Show a satisfying success animation: the message "flies" to the Sent folder
- A notification appears: "Message sent successfully! ✉️"
- The message appears in the Sent folder
- Reset the form

For now, just store submitted messages in a local array (no Supabase yet). We'll add the backend integration later.

## Mobile
On mobile (< 768px), the sidebar becomes a top tab bar with "Compose" and "Inbox" tabs.
```

---

## Phase 8: Easter Egg Game

### Prompt 8.1 — Space Invaders: Bugs vs Code

```
Build the "Space Invaders: Bugs vs Code" Easter egg mini-game for Raja OS:

## Game Concept
A classic Space Invaders clone with a developer theme:

- **Player ship:** A code bracket "{}" or cursor icon, moves left/right at the bottom
- **Enemies:** 5 rows of 8 "bug" aliens that move side-to-side and descend
  - Row 1 (top): Rare bugs worth 30 points — styled as 🐛 or glitch symbols
  - Row 2-3: Medium bugs worth 20 points — styled as 🪲 or error icons
  - Row 4-5: Common bugs worth 10 points — styled as simple geometric shapes
- **Bullets:** Player shoots "|" characters or small cyan projectiles upward
- **Enemy bullets:** Red/error-colored projectiles dropping down randomly

## Power-Ups (randomly dropped by destroyed enemies)
- **"Code Review" (blue):** Triple shot for 10 seconds
- **"CI/CD Pipeline" (green):** Shield that absorbs 1 hit
- **"Stack Overflow" (purple):** Clears all enemies on screen (smart bomb, rare)

## Game Mechanics
- Player has 3 lives (shown as {} icons in the UI)
- Score displayed top-right in monospace font (green, like a commit counter)
- Level counter top-left
- Enemies speed up as fewer remain
- Every 3 cleared waves: a Boss Bug appears (large, takes 10 hits, has a health bar)
- Game over screen with final score + "Play Again" button
- High score saved to localStorage

## Visual Style
- Canvas-based rendering on a dark background (#0A0E17)
- Cyan player, red/orange enemies, green power-ups
- Particle explosion effects when enemies are destroyed (small pixel bursts)
- Screen shake on player hit
- Retro scanline overlay effect (optional, subtle)

## Controls
- Arrow Left/Right or A/D to move
- Space to shoot
- P to pause
- Touch controls on mobile: left/right buttons at bottom + auto-fire

## Technical Implementation
- HTML5 Canvas within an Angular component
- 60fps game loop with requestAnimationFrame
- Entity system: Player, Enemy, Bullet, PowerUp classes
- Collision detection with bounding box
- Sound effects: optional, use Web Audio API for simple beeps (with mute toggle)

## Integration
- Accessible by typing "game" in the Terminal app
- Also triggered by the Konami code (↑↑↓↓←→←→BA) anywhere on the desktop
- Opens in its own window via WindowManagerService
- A subtle game controller icon 🎮 hidden somewhere on the desktop (very small, looks decorative)
```

---

## Phase 9: Supabase Integration

### Prompt 9.1 — Connect to Supabase

```
Set up and integrate Supabase as the backend for Raja OS:

## 1. Supabase Configuration
- Set up the Supabase client in libs/shared/data-access using environment variables:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
- Create environment.ts and environment.prod.ts files for the shell app
- The Supabase client should be provided as an injectable Angular service

## 2. Create Database Tables
Provide me with the SQL migration to create these tables in Supabase:

### projects
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- title: text NOT NULL
- slug: text UNIQUE NOT NULL
- description: text
- long_description: text
- thumbnail_url: text
- images: text[] DEFAULT '{}'
- tech_stack: text[] DEFAULT '{}'
- category: text
- github_url: text
- live_url: text
- featured: boolean DEFAULT false
- display_order: integer DEFAULT 0
- created_at: timestamptz DEFAULT now()

### blog_posts
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- title: text NOT NULL
- slug: text UNIQUE NOT NULL
- excerpt: text
- content: text
- tags: text[] DEFAULT '{}'
- cover_image_url: text
- published: boolean DEFAULT false
- reading_time: integer DEFAULT 5
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

### messages
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- name: text NOT NULL
- email: text NOT NULL
- subject: text NOT NULL
- message: text NOT NULL
- category: text
- read: boolean DEFAULT false
- created_at: timestamptz DEFAULT now()

### visitor_stats
- id: integer PRIMARY KEY DEFAULT 1
- total_visits: integer DEFAULT 0
- last_updated: timestamptz DEFAULT now()

### profile_config (single row)
- id: integer PRIMARY KEY DEFAULT 1
- name: text
- title: text
- bio: text
- avatar_url: text
- resume_url: text
- status: text DEFAULT 'Available'
- current_project: jsonb DEFAULT '{}'
- social_links: jsonb DEFAULT '{}'
- skills: jsonb DEFAULT '[]'
- experience: jsonb DEFAULT '[]'
- education: jsonb DEFAULT '[]'
- certifications: jsonb DEFAULT '[]'

## 3. Row Level Security
- projects: Public read, no public write
- blog_posts: Public read where published = true, no public write
- messages: Public insert only (visitors can send but not read), no public read
- visitor_stats: Public read, public update (increment only via RPC function)
- profile_config: Public read only

## 4. RPC Functions
Create a Supabase RPC function `increment_visitor_count` that atomically increments total_visits.

## 5. Angular Services
Update these services in libs/shared/data-access to use real Supabase calls:
- ProjectsService: getAll(), getBySlug(), getFeatured()
- BlogService: getAll(), getBySlug(), getPublished(), getByTag()
- ContactService: sendMessage()
- ProfileService: getProfile()
- VisitorService: incrementVisit(), getCount()

## 6. Seed Data
Provide a SQL seed script with the mock data we've been using (6 projects, 3 blog posts, 1 profile config).

Replace all hardcoded mock data in the apps with these Supabase service calls.
```

---

## Phase 10: Mobile & Polish

### Prompt 10.1 — Mobile Responsive Layout

```
Implement the mobile responsive experience for Raja OS:

## Breakpoint: 768px
Below this width, the OS desktop metaphor is replaced with a clean mobile layout.

## Changes for Mobile:

### Shell
- Hide the desktop, window management, and taskbar
- Replace with a mobile layout:
  - Top bar: "Raja OS" brand + notification bell + hamburger menu
  - Content area: Full-screen view of the active app (no windows)
  - Bottom navigation bar (fixed): 5 icons for Dashboard, Projects, Blog, Terminal, Contact
  - Active icon highlighted with cyan
  - Tapping an icon switches the full-screen view to that app

### Dashboard
- Widgets stack in a single column
- All widgets become full-width
- Profile card at the top
- Maintain all widget functionality

### Projects
- Single column grid
- Cards are full width
- Filter chips scroll horizontally

### Blog
- Full-width post cards
- Post view: remove the TOC sidebar, make content full-width
- Reduce font sizes slightly

### Terminal
- Full screen view
- Virtual keyboard-friendly input
- Output area takes remaining height
- Font size: 12px on mobile

### Contact
- Remove sidebar, use tabs at the top: "Compose" | "Inbox"
- Full-width form

### Boot Animation
- Still plays on mobile but condensed to 3 seconds
- Smaller text, fewer lines in BIOS phase

### Game
- Touch controls: left/right arrow buttons at the bottom of the canvas
- Auto-fire option (toggle)

## Implementation
Use Tailwind responsive classes (md: prefix) and a shared BreakpointService (using Angular CDK BreakpointObserver or window.matchMedia) to detect mobile vs desktop. The shell should conditionally render either the desktop layout or the mobile layout based on this.

Don't use separate components for mobile — use the SAME components with responsive Tailwind classes wherever possible. Only the Shell's overall layout structure needs conditional rendering.
```

### Prompt 10.2 — Animations & Polish

```
Add polish and refined animations throughout Raja OS:

## Window Animations
- **Open:** Scale from 0.95 to 1.0 + opacity 0 to 1 (200ms ease-out)
- **Close:** Scale from 1.0 to 0.95 + opacity 1 to 0 (150ms ease-in)
- **Minimize:** Window shrinks and slides down toward its taskbar icon (300ms)
- **Maximize:** Smooth expand to fill viewport (200ms)
- **Restore from maximize:** Smooth shrink back to previous size/position (200ms)

## Taskbar Animations
- App icons: subtle bounce on click
- Clock: no animation (just updates)
- Notification bell: gentle shake animation when a notification arrives

## Dashboard Widget Animations
- Staggered entrance: widgets appear one by one with a 50ms delay (scale + fade)
- Number counters: animate from 0 to target value on first render (count-up animation)
- Progress bars/rings: animate from 0 to value

## Hover Effects (global)
- All interactive elements: smooth transition (150ms)
- Buttons: subtle scale(1.02) + glow
- Cards/panels: translateY(-2px) + enhanced border glow
- Links: color transition to cyan

## Loading States
- When remote apps are loading via Module Federation, show:
  - A skeleton loader that matches the app's general layout
  - The futuristic loading spinner from shared/ui
  - Centered in the window with "Loading [App Name]..." text

## Notification Toast
- Slides in from top-right with a subtle spring animation
- Glass panel styled with app icon + message text
- Auto-dismisses after 4 seconds with a slide-out
- Queue system: if multiple notifications, stack them with a small offset

## Sound Effects (Optional)
- Very subtle UI sounds (use Web Audio API, no audio files):
  - Window open: soft "whoosh" (short white noise fade)
  - Notification: gentle "ding" (sine wave, 800Hz, 100ms)
  - Button click: tiny "tick" (1200Hz, 30ms)
- All sounds off by default, toggleable via settings
- Volume: very low (0.1-0.2)

Focus on making everything feel smooth, responsive, and premium. The goal is that every interaction has satisfying visual feedback.
```

---

## Phase 11: Deployment

### Prompt 11.1 — Vercel Deployment Setup

```
Set up Vercel deployment for the Raja OS Nx monorepo with Module Federation:

## Vercel Configuration

1. Create a `vercel.json` in the project root with:
   - Build command that builds all apps via Nx
   - Output directory configuration
   - Rewrites/routes to handle SPA routing for each app
   - Headers for CORS (remoteEntry.js files need to be accessible)

2. Configure the build process:
   - The shell app should be the primary output
   - Remote apps' build outputs (especially remoteEntry.js) should be accessible at predictable URLs
   - Set up the Module Federation remote URLs via environment variables so they can differ per environment

3. Create environment configurations:
   - Development: remotes point to localhost
   - Production: remotes point to the Vercel deployment URL

4. Set up these environment variables in Vercel:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - All remote URLs (or a base URL pattern)

5. Create a GitHub Actions workflow (.github/workflows/deploy.yml):
   - Trigger on push to main
   - Install dependencies (pnpm)
   - Run `nx affected --target=lint`
   - Run `nx affected --target=test`
   - Run `nx affected --target=build --configuration=production`
   - Deploy to Vercel using Vercel CLI

6. SEO setup:
   - Add proper meta tags to shell's index.html
   - Create a sitemap.xml (static for now, can be dynamic later)
   - Create robots.txt
   - Add Open Graph and Twitter Card meta tags
   - Add structured data (JSON-LD) for Person schema

Make sure `vercel deploy` works from the command line for testing.
Provide any troubleshooting notes for common Module Federation + Vercel issues.
```

---

## 🏁 Post-Launch Prompts (Use After v1.0 is Live)

### Optional: Add Guestbook

```
Add a Guestbook feature to Raja OS as a new remote app (apps/guestbook):

- Visitors can leave short messages (like sticky notes)
- Messages are displayed as floating sticky-note cards on a board
- Each note has: message text, visitor name, timestamp
- Notes have different colors (randomly assigned from a set of pastel variants)
- Stored in a Supabase "guestbook" table
- Real-time: new notes appear live using Supabase real-time subscriptions
- Rate limit: 1 message per visitor per day (by IP or session)
- Basic content moderation: filter profanity with a simple word list
- Accessible from the start menu and taskbar
```

### Optional: AI Chat Widget

```
Add an AI-powered chat widget to Raja OS that can answer questions about the portfolio:

- Small floating chat bubble in the bottom-right corner of the desktop
- Clicking opens a chat window (not an OS window — a floating panel)
- Powered by OpenAI API (or Anthropic API) via a Supabase Edge Function
- The Edge Function provides system context: bio, skills, projects, experience
- Visitors can ask things like "What technologies does [Name] know?" or "Tell me about the chat app project"
- Styled to match the OS theme
- Rate limited to prevent abuse (10 messages per session)
- Disclaimer: "This is an AI assistant and may not be 100% accurate"
```

---

## 📋 Quick Reference: Prompt Order

| # | Prompt | Description | Estimated Time |
|---|--------|-------------|----------------|
| 0 | CLAUDE.md | Create project memory file | 5 min |
| 1.1 | Nx + Module Federation | Initialize workspace + all apps | 30-45 min |
| 1.2 | Shared Libraries | UI components, services, models | 30 min |
| 1.3 | Tailwind CSS | Theme setup + design tokens | 15 min |
| 2.1 | Desktop & Taskbar | Shell UI, window containers | 45 min |
| 2.2 | Drag & Resize | Window interactions | 30 min |
| 2.3 | Boot Animation | Cinematic boot sequence | 30 min |
| 3.1 | Dashboard | All widgets | 45-60 min |
| 4.1 | Projects | List + detail views | 30-45 min |
| 5.1 | Blog | Post list + reading view | 30-45 min |
| 6.1 | Terminal | Full interactive CLI | 45-60 min |
| 7.1 | Contact | Mail-themed form | 30 min |
| 8.1 | Space Invaders | Easter egg game | 45-60 min |
| 9.1 | Supabase | Database + integration | 30-45 min |
| 10.1 | Mobile | Responsive layout | 30-45 min |
| 10.2 | Polish | Animations + effects | 30 min |
| 11.1 | Deployment | Vercel + CI/CD | 20-30 min |

**Total estimated Claude Code time: 8-12 hours across multiple sessions**

---

## 💡 Pro Tips

1. **Run `nx serve shell` after every prompt** to verify things work before moving on
2. **If Claude Code gets confused**, start a new session — the CLAUDE.md file will restore context
3. **Don't be afraid to ask Claude Code to refactor** — "The window manager feels laggy, can you optimize it?"
4. **For visual issues**, take a screenshot and describe what's wrong — Claude Code can fix CSS issues well
5. **Save your progress to Git after each phase** — easy to rollback if something breaks
6. **The CLAUDE.md file is your lifeline** — update it as the project evolves

Good luck building Raja OS! 🚀
