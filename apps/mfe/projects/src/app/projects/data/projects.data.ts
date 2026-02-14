import { Project } from '../models/project.model';

export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    slug: 'raja-os',
    title: 'RajaOS - Personal Portfolio Platform',
    description:
      'A modern, interactive portfolio built with Angular and Module Federation, showcasing professional experience through an OS-like interface.',
    category: 'Web Apps',
    techStack: [
      'Angular',
      'Nx',
      'Module Federation',
      'TypeScript',
      'SCSS',
      'RxJS',
    ],
    isFeatured: true,
    isOpenSource: true,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      initials: 'RO',
    },
    links: {
      github: 'https://github.com/rajakalavala/raja-os',
      demo: 'https://raja-os.dev',
    },
    date: '2024',
    teamSize: 'Solo Project',
    overview: [
      'RajaOS is a unique portfolio platform that reimagines the traditional portfolio as an interactive operating system. Built with cutting-edge web technologies, it demonstrates modern frontend architecture patterns.',
      'The platform uses Module Federation to split the application into independently deployable micro frontends, allowing for scalable development and optimized loading performance.',
      'Every aspect of the UI is custom-built with attention to detail, featuring smooth animations, responsive design, and both light and dark themes.',
    ],
    problem:
      'Traditional portfolio websites are static and fail to showcase the depth of a developer\'s technical abilities. I needed a platform that not only displays my work but demonstrates my architectural thinking and modern development skills.',
    role: 'As the sole developer, I architected and implemented the entire platform from concept to deployment. This included designing the micro frontend architecture, building the design system, implementing theme switching, and creating all page components.',
    features: [
      {
        title: 'Micro Frontend Architecture',
        description:
          'Each page is an independent MFE that can be developed, tested, and deployed separately using Nx and Module Federation.',
      },
      {
        title: 'Dynamic Theme System',
        description:
          'Full light/dark mode support with smooth transitions, OS preference detection, and persistent user preferences.',
      },
      {
        title: 'Interactive Dashboard',
        description:
          'A command-center style dashboard with real-time widgets, career metrics, and engaging visualizations.',
      },
      {
        title: 'Responsive Design',
        description:
          'Mobile-first approach ensuring perfect experience across all devices from phones to ultrawide monitors.',
      },
    ],
    challenges: [
      {
        challenge: 'Module Federation shared dependencies',
        solution:
          'Implemented singleton sharing strategy for Angular core libraries and careful version management in webpack configuration.',
      },
      {
        challenge: 'Theme synchronization across MFEs',
        solution:
          'Created a shared ThemeService with localStorage persistence and custom event propagation for instant sync.',
      },
    ],
    results: [
      'Successfully deployed as a production application',
      'Achieved 95+ Lighthouse performance score',
      'Sub-2 second initial load time with lazy-loaded MFEs',
      'Serves as a live demonstration of modern Angular architecture',
    ],
  },
  {
    id: 2,
    slug: 'enterprise-dashboard',
    title: 'Enterprise Analytics Dashboard',
    description:
      'A real-time analytics platform processing millions of events daily, providing actionable insights for enterprise decision-making.',
    category: 'Full-Stack',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'AWS', 'D3.js'],
    isFeatured: true,
    isOpenSource: false,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      initials: 'EA',
    },
    links: {
      demo: 'https://demo.enterprise-analytics.com',
    },
    date: '2023',
    teamSize: 'Team of 6',
    overview: [
      'A comprehensive analytics platform built for enterprise clients to monitor, analyze, and act on their business data in real-time.',
      'The system processes over 1 million events per day through a distributed architecture, providing sub-second query responses.',
      'Features include customizable dashboards, automated alerting, predictive analytics, and export capabilities.',
    ],
    problem:
      'Enterprise clients needed a unified platform to consolidate data from multiple sources and gain real-time insights without relying on batch processing that caused delays in decision-making.',
    role: 'Led the frontend architecture and data visualization layer. Collaborated with backend team on API design and implemented the real-time streaming infrastructure using WebSockets and Kafka.',
    features: [
      {
        title: 'Real-time Data Streaming',
        description:
          'WebSocket-based live updates with intelligent batching to handle high-frequency data without overwhelming the UI.',
      },
      {
        title: 'Custom Dashboard Builder',
        description:
          'Drag-and-drop interface allowing users to create personalized dashboards with 20+ widget types.',
      },
      {
        title: 'Advanced Visualizations',
        description:
          'Custom D3.js charts including heatmaps, sankey diagrams, and geographic maps with drill-down capabilities.',
      },
      {
        title: 'Automated Alerts',
        description:
          'Configurable thresholds with multi-channel notifications (email, Slack, SMS) and escalation policies.',
      },
      {
        title: 'Report Generation',
        description:
          'Scheduled and on-demand PDF reports with custom branding and data export options.',
      },
    ],
    challenges: [
      {
        challenge: 'Handling 10K+ concurrent WebSocket connections',
        solution:
          'Implemented connection pooling with Redis pub/sub for horizontal scaling across multiple server instances.',
      },
      {
        challenge: 'Complex chart rendering performance',
        solution:
          'Used virtual scrolling, Web Workers for data processing, and canvas rendering for large datasets.',
      },
    ],
    results: [
      'Processes 1M+ events daily with 99.9% uptime',
      'Reduced client reporting time from hours to minutes',
      'Adopted by 50+ enterprise customers',
      'Average dashboard load time under 800ms',
    ],
  },
  {
    id: 3,
    slug: 'devops-pipeline',
    title: 'CI/CD Pipeline Orchestrator',
    description:
      'An intelligent build and deployment system that reduced deployment times by 60% through affected-based testing and parallel execution.',
    category: 'Architecture',
    techStack: ['Node.js', 'GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'Go'],
    isFeatured: false,
    isOpenSource: true,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      initials: 'CP',
    },
    links: {
      github: 'https://github.com/rajakalavala/pipeline-orchestrator',
    },
    date: '2023',
    teamSize: 'Team of 3',
    overview: [
      'A smart CI/CD system designed for monorepos that analyzes code changes to determine the minimum set of tests and builds required.',
      'Built on top of Nx affected commands with custom extensions for cross-repo dependencies and shared library detection.',
      'Integrates with multiple cloud providers and supports both containerized and serverless deployments.',
    ],
    problem:
      'Large monorepos suffered from long CI times (2+ hours) because every change triggered full rebuilds. Teams were merging less frequently, leading to integration issues.',
    role: 'Designed the dependency graph analysis algorithm and implemented the GitHub Actions integration. Built the visualization dashboard for pipeline monitoring.',
    features: [
      {
        title: 'Intelligent Affected Analysis',
        description:
          'Graph-based dependency detection that identifies only the projects impacted by a change.',
      },
      {
        title: 'Parallel Execution',
        description:
          'Automatic parallelization of independent tasks with configurable concurrency limits.',
      },
      {
        title: 'Remote Caching',
        description:
          'Distributed build cache shared across all developers and CI runners for instant rebuilds.',
      },
    ],
    challenges: [
      {
        challenge: 'Accurate cross-project dependency detection',
        solution:
          'Built a custom TypeScript analyzer that parses imports and builds a complete dependency graph at the file level.',
      },
    ],
    results: [
      'Reduced average CI time from 2 hours to 15 minutes',
      '60% reduction in cloud compute costs',
      'Enabled 5x more frequent deployments',
      'Open-sourced with 500+ GitHub stars',
    ],
  },
  {
    id: 4,
    slug: 'healthcare-api',
    title: 'Healthcare Integration API',
    description:
      'A HIPAA-compliant API gateway that standardizes data exchange between healthcare providers, supporting HL7 FHIR and legacy formats.',
    category: 'APIs',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'RabbitMQ', 'Docker', 'Azure'],
    isFeatured: false,
    isOpenSource: false,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      initials: 'HA',
    },
    links: {},
    date: '2022',
    teamSize: 'Team of 4',
    overview: [
      'A secure API platform enabling healthcare organizations to exchange patient data while maintaining HIPAA compliance.',
      'Supports modern FHIR R4 standard as well as legacy HL7 v2 messages, with automatic format conversion.',
      'Built with security-first architecture including end-to-end encryption, audit logging, and access controls.',
    ],
    problem:
      'Healthcare providers struggled to share patient information due to incompatible systems and formats. Manual data entry led to errors and delays in patient care.',
    role: 'Led API design and implementation of the FHIR resource handlers. Implemented the audit logging system and conducted security reviews.',
    features: [
      {
        title: 'Multi-format Support',
        description:
          'Automatic conversion between FHIR R4, HL7 v2, and custom CSV formats with validation.',
      },
      {
        title: 'Comprehensive Audit Trail',
        description:
          'Every data access logged with user, timestamp, and purpose for HIPAA compliance.',
      },
      {
        title: 'Role-based Access Control',
        description:
          'Fine-grained permissions at the resource and field level based on user roles.',
      },
    ],
    challenges: [
      {
        challenge: 'Complex HL7 message parsing',
        solution:
          'Built a custom parser with error recovery and fuzzy matching for malformed messages.',
      },
    ],
    results: [
      'Processes 50K+ patient records daily',
      'Passed SOC 2 Type II audit',
      'Zero security incidents in 2 years',
      'Connected 30+ healthcare facilities',
    ],
  },
  {
    id: 5,
    slug: 'component-library',
    title: 'React Component Library',
    description:
      'A comprehensive, accessible component library with 50+ components, used across multiple teams and products.',
    category: 'Open Source',
    techStack: ['React', 'TypeScript', 'Storybook', 'Jest', 'Rollup', 'CSS Modules'],
    isFeatured: false,
    isOpenSource: true,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      initials: 'CL',
    },
    links: {
      github: 'https://github.com/rajakalavala/component-lib',
      demo: 'https://components.raja-os.dev',
    },
    date: '2022',
    teamSize: 'Solo Project',
    overview: [
      'A production-ready component library built with accessibility and developer experience as primary goals.',
      'Features comprehensive Storybook documentation with interactive examples and code snippets.',
      'Used by 3 internal product teams, maintaining consistency across applications.',
    ],
    problem:
      'Multiple product teams were building similar components independently, leading to inconsistent UX and duplicated effort. Accessibility was often an afterthought.',
    role: 'Designed and implemented the entire library from architecture to individual components. Created the documentation system and established contribution guidelines.',
    features: [
      {
        title: 'Full Accessibility',
        description:
          'WCAG 2.1 AA compliant with keyboard navigation, screen reader support, and focus management.',
      },
      {
        title: 'Theme Customization',
        description:
          'CSS custom properties allow complete visual customization without modifying source code.',
      },
      {
        title: 'Tree Shaking',
        description:
          'Import only what you need with zero impact on bundle size for unused components.',
      },
    ],
    challenges: [
      {
        challenge: 'Complex component composition patterns',
        solution:
          'Implemented compound component pattern with context for flexible yet type-safe composition.',
      },
    ],
    results: [
      '50+ production-ready components',
      'Adopted by 3 product teams (50+ developers)',
      '100% test coverage',
      '500+ npm downloads per week',
    ],
  },
  {
    id: 6,
    slug: 'ecommerce-platform',
    title: 'E-Commerce Microservices',
    description:
      'A scalable e-commerce backend built with microservices architecture, handling 100K+ daily transactions.',
    category: 'Full-Stack',
    techStack: [
      'Node.js',
      'Express',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'Docker',
      'AWS',
    ],
    isFeatured: false,
    isOpenSource: false,
    isProduction: true,
    thumbnail: {
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      initials: 'EC',
    },
    links: {},
    date: '2021',
    teamSize: 'Team of 8',
    overview: [
      'A complete e-commerce platform rebuilt from monolith to microservices to handle rapid growth.',
      'Services include catalog, cart, checkout, payments, inventory, and notifications.',
      'Implemented event-driven architecture for loose coupling and independent scalability.',
    ],
    problem:
      'The legacy monolithic application couldn\'t scale to meet growing demand. Deployments were risky and slow, and a bug in one area could bring down the entire platform.',
    role: 'Architected the microservices decomposition strategy. Led implementation of the cart and checkout services. Set up the event bus and defined service communication patterns.',
    features: [
      {
        title: 'Event-Driven Architecture',
        description:
          'Services communicate through events, enabling loose coupling and eventual consistency.',
      },
      {
        title: 'Distributed Caching',
        description:
          'Redis cluster for session management, cart persistence, and query caching.',
      },
      {
        title: 'Full-Text Search',
        description:
          'Elasticsearch powers product search with faceted filtering and typo tolerance.',
      },
      {
        title: 'Payment Processing',
        description:
          'Supports multiple payment providers with automatic failover and retry logic.',
      },
    ],
    challenges: [
      {
        challenge: 'Maintaining data consistency across services',
        solution:
          'Implemented saga pattern for distributed transactions with compensating actions for rollback.',
      },
      {
        challenge: 'Service discovery and routing',
        solution:
          'Deployed service mesh with automatic load balancing and circuit breakers.',
      },
    ],
    results: [
      'Handles 100K+ daily transactions',
      'Reduced deployment time from days to hours',
      '99.95% uptime achieved',
      '40% reduction in infrastructure costs',
    ],
  },
];
