# RajaOS

> A personal operating system platform showcasing professional experience, technical capabilities, and engineering philosophy through an interactive, data-driven web application.

![Angular](https://img.shields.io/badge/Angular-21.0.6-red?logo=angular)
![Nx](https://img.shields.io/badge/Nx-22.3.3-blue?logo=nx)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)
![Module Federation](https://img.shields.io/badge/Module%20Federation-Enabled-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Current Status](#current-status)
- [Features & Pages](#features--pages)
- [Design System](#design-system)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)

---

## 🎯 Overview

**RajaOS** is a modern web platform built to serve as both a professional portfolio and a demonstration of cutting-edge web architecture. It leverages Angular's standalone components, Nx monorepo tooling, and Module Federation to create a scalable, maintainable micro frontend architecture.

### Vision

Create an engaging, interactive platform to present professional experience and technical work while demonstrating expertise in modern web architecture (Angular, Nx, Module Federation).

### Target Audience

- Recruiters and hiring managers
- Technical leaders and architects
- Potential collaborators and clients
- Engineering community members

---

## 🏗️ Architecture

RajaOS uses **Module Federation** to implement a micro frontend architecture, enabling:

- **Independent Development**: Each page is a separate micro frontend (MFE)
- **Lazy Loading**: MFEs load on-demand for optimal performance
- **Shared Dependencies**: Angular core packages shared across all MFEs
- **Scalability**: Easy to add new features without impacting existing code

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Shell (Host)                        │
│                  Port: 4200                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  Sidebar Navigation + Routing + Theme        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │Dashboard │  │Production│  │Architecture│
    │MFE:4202  │  │History   │  │   MFE     │
    └──────────┘  └──────────┘  └──────────┘
```

**Shell (Host)**: Main container at `apps/shell/` (Port 4200)
- Loads and orchestrates all remote micro frontends
- Contains sidebar navigation and routing
- Provides shared layout and theme system

**Remote MFEs**: Independent micro frontend applications at `apps/mfe/`
- Each page is a separate, independently deployable application
- Exposed as remote modules via Module Federation
- Lazy-loaded on route navigation

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.0.6 | Frontend framework (Standalone Components) |
| **Nx** | 22.3.3 | Monorepo management and build tooling |
| **TypeScript** | 5.9.2 | Type-safe programming language |
| **Module Federation** | 0.21.2 | Micro frontend architecture |
| **SCSS** | - | Styling with CSS custom properties |
| **RxJS** | 7.8.0 | Reactive programming |

### Build & Development Tools

- **Webpack**: Module bundling with Module Federation plugin
- **Vite/Vitest**: Fast unit testing
- **Playwright**: End-to-end testing
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting

### Future Stack

- **Node.js/Express**: Backend API (planned)
- **Angular Signals**: Reactive state management
- **Angular Universal**: Server-side rendering (SSR)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

Verify installation:

```bash
node --version  # Should be v20.x or higher
npm --version   # Should be v10.x or higher
git --version   # Any recent version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RajaKalavala/raja-os.git
cd raja-os
```

### 2. Install Dependencies

```bash
npm install
```

> **Note**: If you encounter peer dependency warnings, you may need to use `npm install --legacy-peer-deps`

### 3. Verify Installation

```bash
npx nx graph
```

This will open an interactive dependency graph in your browser, confirming that the workspace is set up correctly.

---

## ▶️ Running the Application

### Development Mode

#### Start the Shell (Recommended)

```bash
npm start
# OR
npx nx serve shell
```

This will:
- Start the Shell application on `http://localhost:4200`
- Automatically serve remote MFEs as needed
- Enable hot module replacement (HMR)

**The application will be available at: http://localhost:4200**

#### Start Individual MFEs

For debugging or isolated development:

```bash
# Dashboard MFE (Port 4202)
npx nx serve dashboard

# Future MFEs will have similar commands
npx nx serve production-history
npx nx serve architecture
```

### Production Build

#### Build the Shell

```bash
npm run build
# OR
npx nx build shell --configuration=production
```

#### Build All Projects

```bash
npm run build:all
# OR
npx nx run-many -t build --all --configuration=production
```

### Preview Production Build

```bash
npm run preview
# OR
npx nx preview shell
```

---

## 📁 Project Structure

```
raja-os/
├── apps/
│   ├── shell/                      # Shell (Host) Application - Port 4200
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── sidebar/       # Navigation sidebar component
│   │   │   │   ├── app.routes.ts  # Main routing configuration
│   │   │   │   └── app.component.ts
│   │   │   ├── styles.scss         # Global styles and theme variables
│   │   │   └── index.html          # Theme initialization script
│   │   └── webpack.config.ts       # Module Federation host config
│   │
│   ├── mfe/                        # Micro Frontend Applications
│   │   ├── dashboard/              # ✅ Dashboard MFE - Port 4202 (Implemented)
│   │   ├── system-overview/        # ❌ System Overview MFE (Not started)
│   │   ├── production-history/     # ❌ Production History MFE (Priority 1)
│   │   ├── builds/                 # ❌ Builds MFE (Not started)
│   │   ├── architecture/           # ❌ Architecture MFE (Not started)
│   │   ├── ai-lab/                 # ❌ AI Lab MFE (Not started)
│   │   ├── engineering-notes/      # ❌ Engineering Notes MFE (Not started)
│   │   ├── now/                    # ❌ Now MFE (Not started)
│   │   └── ping-me/                # ❌ Ping Me/Contact MFE (Not started)
│   │
│   └── api/                        # Backend API (Future)
│
├── libs/
│   ├── design-system/              # Shared component library
│   │   └── src/lib/                # Reusable UI components
│   │
│   └── shared/
│       └── models/                 # Shared TypeScript interfaces and data models
│
├── docs/                           # Project documentation
│   ├── prd.md                      # Product Requirements Document
│   ├── features.md                 # Comprehensive feature documentation
│   ├── deployment.md               # Deployment guide
│   ├── deploy-now.md               # Quick deployment checklist
│   ├── prod-deployment.md          # MFE production deployment checklist
│   ├── implementation-guide.md     # Claude Code implementation guide
│   ├── claude-cheatsheet.md        # Claude cheatsheet
│   └── setup.md                    # Project setup guide
│
├── CLAUDE.md                       # AI assistant instructions
├── nx.json                         # Nx workspace configuration
├── tsconfig.base.json              # TypeScript path mappings
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

### Application Ports

| Application | Port | Status |
|------------|------|--------|
| Shell (Host) | 4200 | ✅ Running |
| Dashboard MFE | 4202 | ✅ Implemented |
| Other MFEs | 4203-4210 | ❌ Not started |
| API | 3000 | 🔮 Planned |

---

## 📜 Available Scripts

### Development

```bash
# Start the application
npm start                           # Serves shell on port 4200

# Serve specific MFE
npx nx serve dashboard              # Serves dashboard on port 4202

# Build for production
npm run build                       # Builds shell
npm run build:all                   # Builds all projects

# Preview production build
npm run preview                     # Previews shell production build
```

### Code Quality

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint shell
npx nx lint dashboard

# Format code with Prettier
npx nx format:write
```

### Testing

```bash
# Run all tests
npx nx run-many -t test

# Test specific project
npx nx test dashboard

# Run E2E tests (when configured)
npx nx e2e shell-e2e

# Run tests in watch mode
npx nx test dashboard --watch
```

### Nx Utilities

```bash
# View dependency graph
npx nx graph

# Show project details
npx nx show project shell --web

# List all plugins
npx nx list

# View affected projects
npx nx affected:graph

# Build only affected projects
npx nx affected -t build

# Run tasks in parallel
npx nx run-many -t build test lint --parallel=3
```

---

## 👨‍💻 Development Workflow

### Adding a New MFE

1. **Generate the application**:
   ```bash
   npx nx g @nx/angular:app <name> --directory=apps/mfe/<name>
   ```

2. **Configure Module Federation**:
   - Update `apps/mfe/<name>/webpack.config.ts` to expose the remote module
   - Add appropriate port configuration
   - Update `apps/shell/webpack.config.ts` to include the new remote
   - Add route configuration in `apps/shell/src/app/app.routes.ts`

3. **Use Standalone Components**: All components should use `standalone: true`

4. **Follow the pattern**: Reference `apps/mfe/dashboard/` as a template

### Working with the Theme System

The application supports light/dark mode via CSS custom properties:

**Global Theme Variables** (defined in `apps/shell/src/styles.scss`):
```scss
// Light mode (default)
:root {
  --bg-page: #f9fafb;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --accent-green: #22c55e;
}

// Dark mode
html[data-theme='dark'] {
  --bg-page: #1b1d1e;
  --bg-card: #181a1b;
  --text-primary: #d6d3cd;
  --accent-green: #4ae081;
}
```

**Important**: Always use CSS variables for colors, never hardcode them:
```scss
// ✅ Correct
background-color: var(--bg-card);
color: var(--text-primary);

// ❌ Incorrect
background-color: #ffffff;
color: #111827;
```

### Adding Design System Components

1. Create component in `libs/design-system/src/lib/`
2. Export from `libs/design-system/src/index.ts`
3. Use design tokens from `docs/prd.md`
4. Ensure theme compatibility (light/dark modes)
5. Document usage

---

## 📊 Current Status

### ✅ Completed (Phase 1)

- [x] Shell application with Module Federation
- [x] Sidebar navigation with all planned routes
- [x] Responsive layout structure
- [x] Theme system (light/dark mode toggle)
- [x] Dashboard MFE with basic features
- [x] Design system library scaffolding
- [x] Nx workspace configuration

### 🔨 In Progress (Phase 2)

- [ ] Refine Dashboard data models
- [ ] Implement real data integration
- [ ] Add animations and transitions
- [ ] Improve mobile responsiveness
- [ ] Expand design system components

### 📋 Planned (Phase 3 & Beyond)

- [ ] Production History MFE (Priority 1)
- [ ] Architecture MFE
- [ ] AI Lab MFE
- [ ] System Overview MFE
- [ ] Builds MFE
- [ ] Engineering Notes MFE
- [ ] Ping Me MFE
- [ ] Now MFE

**Overall Progress**: ~15% complete (1 of 9 MFEs implemented)

---

## 🎨 Features & Pages

### 1. Dashboard (✅ Implemented)

**Purpose**: High-level overview of professional experience and current focus

**Features**:
- Career metrics display (experience, systems, data processed)
- Career timeline visualization
- Contribution distribution chart
- Impact areas display
- Current focus progress tracker
- Featured builds preview
- Dark/light theme toggle

### 2. Production History (Priority 1 - Not Started)

**Purpose**: Chronicle significant production deployments, incidents, and learnings

**Features**:
- Timeline of production events
- Event categories (Deployment, Incident, Migration, Launch)
- Severity/Impact indicators
- Lessons learned section
- Metrics and outcomes

### 3. Architecture (Not Started)

**Purpose**: Deep dive into architectural decisions, patterns, and design philosophy

**Features**:
- Architecture diagrams (C4 model)
- Design pattern showcase
- Architecture decision records (ADRs)
- Case studies
- Best practices documentation

### 4. AI Lab (Not Started)

**Purpose**: Showcase AI/ML work, experiments, and research

**Features**:
- AI/ML project showcase
- Interactive demos
- Research papers
- Experiment results
- Model performance metrics

### 5. System Overview (Not Started)

**Purpose**: Comprehensive view of all systems and platforms built

**Features**:
- Grid/list view of systems
- System categories and status
- Key metrics per system
- Technology stack tags
- Search and filter

### 6. Builds (Not Started)

**Purpose**: Showcase projects, side projects, and technical experiments

**Features**:
- Project gallery
- Technology stack display
- GitHub repository links
- Live demo links
- Featured projects

### 7. Engineering Notes (Not Started)

**Purpose**: Technical writing, tutorials, and engineering insights

**Features**:
- Blog post listing
- Full-text search
- Tag-based filtering
- Code syntax highlighting
- Related posts suggestions

### 8. Now (Not Started)

**Purpose**: Current focus, activities, and what's happening now

**Features**:
- Current focus areas
- Recent activities timeline
- Reading list
- Learning goals and progress
- Availability status

### 9. Ping Me (Not Started)

**Purpose**: Enable engagement and communication with visitors

**Features**:
- Contact form
- Social media links
- Email subscription
- FAQ section
- Calendly integration

---

## 🎨 Design System

### Core Components (Planned)

- **Layout**: Container, Grid, Stack
- **Navigation**: Sidebar, Breadcrumb, Tabs
- **Forms**: Input, Textarea, Select, Checkbox
- **Feedback**: Button, Badge, Tooltip, Toast, Modal
- **Data Display**: Card, Typography, Icon, Table
- **Loading States**: Spinner, Skeleton, Progress Bar

### Design Tokens

- **Colors**: Primary (Green), Background (Dark/Light), Text, Borders
- **Typography**: Font families, sizes, weights
- **Spacing**: xs, sm, md, lg, xl, 2xl
- **Shadows**: sm, md, lg
- **Transitions**: fast (150ms), base (200ms), slow (300ms)

See `docs/prd.md` for complete design token specifications.

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

### Reporting Issues

If you find a bug or have a feature suggestion, please open an issue on GitHub.

### Code Style

- **TypeScript**: Use strict mode, explicit types, avoid `any`
- **Components**: Standalone components only, small and focused
- **Styling**: Use CSS variables, mobile-first approach
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Testing**: Write tests for new features

### Development Guidelines

1. Follow Angular style guide
2. Use Nx generators for creating components/libraries
3. Ensure theme compatibility (light/dark modes)
4. Write clear commit messages
5. Test your changes before submitting

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Comprehensive project instructions for AI assistants and developers
- **[prd.md](./docs/prd.md)**: Product Requirements Document with detailed feature specifications
- **[Nx Documentation](https://nx.dev)**: Official Nx documentation
- **[Angular Documentation](https://angular.io)**: Official Angular documentation
- **[Module Federation Guide](https://webpack.js.org/concepts/module-federation/)**: Webpack Module Federation documentation

---

## 📈 Performance Targets

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90 (all categories)
- **Bundle Size**: Shell < 200KB, MFEs < 150KB each

---

## 🔒 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

---

## 👤 Contact

**Raja Kalavala**

- GitHub: [@RajaKalavala](https://github.com/RajaKalavala)
- LinkedIn: [Raja Kalavala](https://linkedin.com/in/rajakalavala)

---

## 🙏 Acknowledgments

Built with:
- [Angular](https://angular.io) - The modern web framework
- [Nx](https://nx.dev) - Smart monorepo tools
- [Module Federation](https://webpack.js.org/concepts/module-federation/) - Micro frontend architecture

---

<div align="center">

**Made with ❤️ by Raja Kalavala**

[View Live Site](#) | [Report Bug](https://github.com/RajaKalavala/raja-os/issues) | [Request Feature](https://github.com/RajaKalavala/raja-os/issues)

</div>
