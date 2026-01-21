<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

---

# RajaOS - Project Instructions

## Project Overview

**RajaOS** is a personal operating system platform built to showcase professional experience, technical capabilities, and engineering philosophy through an interactive, data-driven web application. It serves as both a portfolio and a demonstration of modern web architecture.

### Key Information
- **Product Requirements Document**: See `prd.md` in project root for comprehensive feature requirements, data models, and roadmap
- **Architecture**: Module Federation with Angular Standalone Components
- **Monorepo**: Nx workspace
- **Current Status**: Shell complete, Dashboard implemented (needs updates), 8 pages pending

## Architecture

### Module Federation Structure

This project uses **Module Federation** to create a micro frontend architecture:

- **Shell (Host)**: Main container application at `apps/shell/` (Port 4200)
  - Loads and orchestrates all remote micro frontends
  - Contains sidebar navigation and routing
  - Provides shared layout and theme

- **Remote MFEs**: Independent micro frontend applications at `apps/mfe/`
  - `dashboard/` - Dashboard page (Port 4202) - ✅ Implemented
  - `system-overview/` - System Overview page - ❌ Not started
  - `production-history/` - Production History page - ❌ Not started (Priority 1)
  - `builds/` - Builds showcase page - ❌ Not started
  - `architecture/` - Architecture documentation - ❌ Not started
  - `ai-lab/` - AI/ML projects showcase - ❌ Not started
  - `engineering-notes/` - Blog/technical writing - ❌ Not started
  - `now/` - Current focus page - ❌ Not started
  - `ping-me/` - Contact page - ❌ Not started

### Libraries

- `libs/design-system/` - Shared component library (needs expansion)
- `libs/shared/models/` - Shared TypeScript interfaces and data models
- `libs/shop/*` - Legacy libraries from template (can be removed if not needed)

### Application Ports

- Shell: 4200
- Dashboard MFE: 4202
- Future MFEs: 4203-4210 (as needed)
- API: 3000 (when implemented)

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
- **Pattern**: Define TypeScript interfaces matching the data models in `prd.md`
- **Example**: See Dashboard component for MetricCard, CareerMilestone, etc.

### Styling

- **Framework**: SCSS
- **Theme**: Dark mode (primary green: #22c55e, dark backgrounds)
- **Design Tokens**: See `prd.md` Design System section
- **Responsive**: Mobile-first approach

## Important Files and Locations

### Configuration
- `nx.json` - Nx workspace configuration
- `tsconfig.base.json` - TypeScript path mappings
- `apps/shell/webpack.config.ts` - Module Federation host config
- `apps/mfe/*/webpack.config.ts` - Remote MFE configs

### Navigation
- `apps/shell/src/app/app.routes.ts` - Main routing configuration
- `apps/shell/src/app/sidebar/sidebar.component.ts` - Navigation menu (all routes defined)

### Key Reference Files
- `prd.md` - Complete product requirements and data models
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

Based on the development roadmap in `prd.md`:

### Phase 2: Dashboard Completion (Current)
- [ ] Refine Dashboard data models
- [ ] Implement real data integration
- [ ] Add animations and transitions
- [ ] Improve mobile responsiveness
- [ ] Add interactive features

### Phase 3: High Priority Pages (Next)
- [ ] Create Production History MFE (Priority 1)
- [ ] Create Architecture MFE
- [ ] Create AI Lab MFE
- [ ] Expand design system components

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

1. Check `prd.md` for feature requirements and data models
2. Generate new Angular app in `apps/mfe/`
3. Configure Module Federation (webpack.config.ts)
4. Add route to shell's app.routes.ts
5. Implement components following data models in PRD
6. Add to sidebar navigation (already present, just needs implementation)

### Adding Design System Components

1. Create component in `libs/design-system/src/lib/`
2. Export from `libs/design-system/src/index.ts`
3. Use design tokens from `prd.md`
4. Create Storybook story (if Storybook is set up)
5. Document usage

### Working with Data

1. Define TypeScript interfaces based on `prd.md` data models
2. Create service in MFE or shared location
3. Implement data fetching/management
4. Use Angular signals for reactive state (preferred)

## Key Reminders

- **Always check `prd.md`** for feature requirements and data models before implementing
- **Module Federation**: Each MFE is independently deployable
- **Standalone Components**: No NgModules, use standalone: true
- **Design System**: Build reusable components, avoid duplication
- **Data Models**: Follow the TypeScript interfaces defined in PRD
- **Nx Commands**: Always use `nx` for running tasks
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Consider from the start, not as afterthought

## Getting Help

- **For Nx questions**: Use `nx_docs` MCP tool
- **For workspace structure**: Use `nx_workspace` MCP tool
- **For project details**: Use `nx_project_details` MCP tool
- **For feature requirements**: Check `prd.md`
- **For architecture questions**: See Architecture section in `prd.md`

## References

- Product Requirements: `prd.md`
- Nx Documentation: https://nx.dev
- Angular Documentation: https://angular.io
- Module Federation: https://webpack.js.org/concepts/module-federation/
