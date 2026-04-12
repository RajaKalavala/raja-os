<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->

---

# RajaOS - Project Instructions

## Project Overview

**RajaOS** is a personal operating system platform built to showcase professional experience, technical capabilities, and engineering philosophy through an interactive, data-driven web application. It serves as both a portfolio and a demonstration of modern web architecture.

### Key Information

- **Product Requirements Document**: See `docs/prd.md` for comprehensive feature requirements, data models, and roadmap
- **Architecture**: Module Federation with Angular Standalone Components
- **Monorepo**: Nx workspace
- **Features Documentation**: See `docs/features.md` for comprehensive feature documentation
- **Current Status**: Shell complete with 8 deployed MFEs, Jarvis AI system, Health MFE, global mascot chatbot, Supabase backend

## Architecture

### Module Federation Structure

This project uses **Module Federation** to create a micro frontend architecture:

- **Shell (Host)**: Main container application at `apps/shell/` (Port 4200)
  - Loads and orchestrates all remote micro frontends
  - Contains sidebar navigation and routing
  - Provides shared layout and theme

- **Remote MFEs**: Independent micro frontend applications at `apps/mfe/`
  - `dashboard/` - Dashboard & command center (Port 4202) - ✅ Implemented
  - `aboutme/` - About Me page (Port 4204) - ✅ Implemented
  - `experience/` - Career timeline (Port 4203) - ✅ Implemented
  - `projects/` - Projects showcase + Automations (Port 4205) - ✅ Implemented
  - `blogs/` - Developer blog (Port 4206) - ✅ Implemented
  - `planner/` - Productivity planner with Kanban, Goals, Ideas, Habits, Brainstorm (Port 4207) - ✅ Implemented (Admin-only)
  - `jarvis/` - AI intelligence layer with 8 sub-pages (Port 4208) - ✅ Implemented (Admin-only)
  - `health/` - Health archive with AI advisor, medical vault, 10 sub-pages (Port 4210) - ✅ Implemented (Admin-only)

- **Shell Global Components** (not MFEs, live in `apps/shell/src/app/`):
  - `sidebar/` - Navigation with nudge notifications
  - `jarvis-mascot/` - Animated robot mascot chatbot (bottom-right, all pages)
  - Morning briefing overlay (auto-shows daily for admin)
  - Quick capture modal (Cmd+Shift+J)

### Libraries

- `libs/design-system/` - Shared component library
- `libs/shared/models/` - Shared TypeScript interfaces and data models
- `libs/shared/supabase/` - Supabase client service (auth, database, RLS)
- `libs/shared/jarvis/` - Jarvis AI services, models, prompts, nudge service
- `libs/shared/health/` - Health AI providers (multi-model), health data services, models
- `libs/shop/*` - Legacy libraries from template (can be removed if not needed)

### Application Ports

- Shell: 4200
- Dashboard MFE: 4202
- Experience MFE: 4203
- About Me MFE: 4204
- Projects MFE: 4205
- Blogs MFE: 4206
- Planner MFE: 4207
- Jarvis MFE: 4208
- Health MFE: 4210

## Development Guidelines

### When Creating New MFEs

1. **Generate the application** using Nx generators:

   ```bash
   npx nx g @nx/angular:app <name> --directory=apps/mfe/<name>
   ```

2. **Configure Module Federation**:
   - Update `webpack.config.ts` to expose the remote module
   - Add appropriate port configuration
   - Update shell's `webpack.config.ts` to include the new remote
   - Add route configuration in shell's `app.routes.ts`

3. **Use Standalone Components**: All components should be standalone (not NgModules)

4. **Follow the pattern**: Reference existing Dashboard MFE at `apps/mfe/dashboard/` as template

### Working with the Design System

- **Location**: `libs/design-system/`
- **Status**: Basic scaffolding only, needs component development
- **Priority Components** (see prd.md for full list):
  - Button, Card, Typography, Badge, Icon
  - Input, Navigation, Layout, Loading States
  - Modal, Tooltip, Toast Notifications

### Data Models

- **Location**: `libs/shared/models/` or within individual MFE projects
- **Pattern**: Define TypeScript interfaces matching the data models in `docs/prd.md`
- **Example**: See Dashboard component for MetricCard, CareerMilestone, etc.

### Styling

- **Framework**: SCSS with CSS Custom Properties for theming
- **Theme System**:
  - Light/Dark mode toggle implemented globally
  - Theme managed via CSS variables in `apps/shell/src/styles.scss`
  - ThemeService in shell (`apps/shell/src/app/services/theme.service.ts`)
  - Persists to localStorage as `'raja-os-theme'`
  - Respects OS `prefers-color-scheme` on first visit
  - Toggle button in dashboard header (sun/moon icon)
- **Color Palette**:
  - Light mode: White cards (#ffffff), light gray page (#f9fafb), dark text (#111827)
  - Dark mode: DarkReader-style palette - dark gray cards (#181a1b), page (#1b1d1e), light text (#d6d3cd)
  - Green accent: #22c55e (light), #4ae081 (dark)
- **Design Tokens**: All colors use CSS variables (e.g., `var(--bg-card)`, `var(--text-primary)`)
- **Responsive**: Mobile-first approach

## Important Files and Locations

### Configuration

- `nx.json` - Nx workspace configuration
- `tsconfig.base.json` - TypeScript path mappings
- `apps/shell/webpack.config.ts` - Module Federation host config
- `apps/mfe/*/webpack.config.ts` - Remote MFE configs
- `apps/shell/src/styles.scss` - Global theme CSS variables (light/dark modes)
- `apps/shell/src/index.html` - Theme initialization script (prevents FOUC)

### Navigation

- `apps/shell/src/app/app.routes.ts` - Main routing configuration
- `apps/shell/src/app/sidebar/sidebar.component.ts` - Navigation menu with nudge notifications

### Shell Global Components

- `apps/shell/src/app/jarvis-mascot/` - Animated robot mascot chatbot (3 files: .ts, .html, .scss)
- `apps/shell/src/app/app.ts` - Root component with morning briefing overlay, quick capture modal
- `apps/shell/src/app/services/theme.service.ts` - Theme management service

### Key Reference Files

- `docs/prd.md` - Complete product requirements and data models
- `docs/features.md` - Comprehensive feature documentation
- `docs/prod-deployment.md` - MFE production deployment checklist
- `docs/deployment.md` - Deployment guide
- `docs/deploy-now.md` - Quick deployment checklist
- `docs/implementation-guide.md` - Claude Code implementation guide
- `docs/claude-cheatsheet.md` - Claude cheatsheet
- `docs/setup.md` - Project setup guide
- `README.md` - General Nx repository information
- `AGENTS.md` - Nx MCP configuration

## Running the Application

### Development

```bash
# Serve shell (host) - will auto-serve remotes as needed
npx nx serve shell

# Serve dashboard MFE independently (for debugging)
npx nx serve dashboard

# Build all projects
npx nx run-many -t build

# Run linting
npx nx run-many -t lint
```

### Module Federation Development

When shell is served with `nx serve shell`, it will automatically start remote MFEs based on the Module Federation configuration. The shell runs on port 4200 and loads remotes on their configured ports.

## Current Priorities

### Completed
- [x] Dark/light theme toggle
- [x] All 7 MFEs (Dashboard, About Me, Experience, Projects, Blogs, Planner, Jarvis)
- [x] Supabase backend with RLS
- [x] Jarvis AI system (8 sub-pages: Home, Briefing, Chat, Focus, Capture, Metrics, Review, Memory)
- [x] Planner with Goals, Tasks, Ideas, Board, Habits, Brainstorm
- [x] Projects with Automations (LinkedIn post generator)
- [x] Smart nudge notifications in sidebar
- [x] Jarvis mascot chatbot (animated robot, dual-mode AI)
- [x] Morning briefing overlay, Quick capture (Cmd+Shift+J)

### Next
- [ ] Real data integration for dashboard metrics
- [ ] Design system component library expansion
- [ ] X/Twitter automation integration
- [ ] Content calendar with scheduling
- [ ] Terminal emulator page

## Code Quality Standards

### TypeScript

- Use strict mode
- Define explicit types (avoid `any`)
- Use interfaces for data models
- Follow Angular style guide

### Components

- Standalone components only
- Small, focused components
- Clear input/output contracts
- Proper lifecycle management

### Performance

- Lazy load routes
- Code splitting via Module Federation
- Optimize bundle sizes
- Use OnPush change detection where possible

### Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

## Common Tasks

### Adding a New Page/MFE

1. Check `docs/prd.md` for feature requirements and data models
2. Generate new Angular app in `apps/mfe/`
3. Configure Module Federation (webpack.config.ts)
4. Add route to shell's app.routes.ts
5. Implement components following data models in PRD
6. Add to sidebar navigation (already present, just needs implementation)

### Adding Design System Components

1. Create component in `libs/design-system/src/lib/`
2. Export from `libs/design-system/src/index.ts`
3. Use design tokens from `docs/prd.md`
4. Create Storybook story (if Storybook is set up)
5. Document usage

### Working with Data

1. Define TypeScript interfaces based on `docs/prd.md` data models
2. Create service in MFE or shared location
3. Implement data fetching/management
4. Use Angular signals for reactive state (preferred)

### Working with the Theme System

The application supports light/dark mode theming via CSS custom properties:

**Theme Architecture:**
- Global CSS variables defined in `apps/shell/src/styles.scss`
- Two theme blocks: `:root` (light) and `html[data-theme='dark']` (dark)
- ThemeService manages theme state and persistence (`apps/mfe/dashboard/src/app/services/theme.service.ts`)
- Inline script in `apps/shell/src/index.html` prevents flash of unstyled content (FOUC)

**When Styling Components:**
1. **Never use hardcoded colors** - always use CSS variables
2. **Common variables**:
   - Backgrounds: `var(--bg-page)`, `var(--bg-card)`, `var(--bg-card-alt)`, `var(--bg-icon)`
   - Text: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
   - Borders: `var(--border-primary)`, `var(--border-light)`
   - Accents: `var(--accent-green)`, `var(--accent-green-dark)`, `var(--text-value)`
   - Semantic: `var(--status-active)`, `var(--card-shadow)`
3. **For SVG inline attributes** that can't use CSS vars directly, use CSS classes instead (e.g., `.donut-bg-circle`, `.career-point`)
4. **Testing themes**: Toggle with sun/moon button in dashboard header, verify both modes look correct

**Theme Persistence:**
- Saved to localStorage as `'raja-os-theme'` with value `'light'` or `'dark'`
- On first visit, respects OS `prefers-color-scheme: dark`
- Listens to OS preference changes if user hasn't manually toggled

**Components that stay dark in both modes:**
- Sidebar navigation
- Admin login modal
- Timer card gradient in time tracker
- Jarvis mascot chatbot (robot + chat panel)

## Key Reminders

- **Always check `docs/prd.md`** for feature requirements and data models before implementing
- **Module Federation**: Each MFE is independently deployable
- **Standalone Components**: No NgModules, use standalone: true
- **Theme System**: Use CSS variables for all colors to support light/dark modes (`var(--bg-card)`, etc.)
- **Design System**: Build reusable components, avoid duplication
- **Data Models**: Follow the TypeScript interfaces defined in PRD
- **Nx Commands**: Always use `nx` for running tasks
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Consider from the start, not as afterthought
- **Angular Best Practices**: Use `inject()` function instead of constructor injection

## Getting Help

- **For Nx questions**: Use `nx_docs` MCP tool
- **For workspace structure**: Use `nx_workspace` MCP tool
- **For project details**: Use `nx_project_details` MCP tool
- **For feature requirements**: Check `docs/prd.md`
- **For architecture questions**: See Architecture section in `docs/prd.md`

## References

- Product Requirements: `docs/prd.md`
- Nx Documentation: https://nx.dev
- Angular Documentation: https://angular.io
- Module Federation: https://webpack.js.org/concepts/module-federation/
