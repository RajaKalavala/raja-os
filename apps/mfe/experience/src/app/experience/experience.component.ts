import {
  Component,
  OnInit,
  AfterViewInit,
  signal,
  computed,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';

interface Role {
  id: number;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  duration: string;
  isCurrent: boolean;
  impacts: string[];
  techStack: string[];
  highlight?: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  achievements: string[];
}

interface SkillsAtYear {
  year: string;
  skills: string[];
  newSkills?: string[];
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  standalone: true,
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  @ViewChildren('timelineCard') timelineCards!: QueryList<ElementRef>;
  @ViewChildren('timelineNode') timelineNodes!: QueryList<ElementRef>;

  selectedSkillYear = signal<string>('Now');
  timelineProgress = signal<number>(0);

  // Computed stats
  totalYears = computed(() => {
    const startYear = 2016;
    const currentYear = new Date().getFullYear();
    return currentYear - startYear;
  });

  totalCompanies = computed(() => this.roles.length);
  totalProjects = signal<number>(15);

  roles: Role[] = [
    {
      id: 1,
      company: 'TechCorp Solutions',
      title: 'Principal Software Architect',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: null,
      duration: '3+ years',
      isCurrent: true,
      impacts: [
        'Led migration to microfrontend architecture, serving 2M+ users',
        'Reduced build times by 60% with Nx and affected-based CI',
        'Mentored 5 engineers from junior to mid-level',
      ],
      techStack: [
        'Angular',
        'Nx',
        'TypeScript',
        'Module Federation',
        'AWS',
        'Node.js',
      ],
      highlight: 'Promoted to Principal within 18 months',
    },
    {
      id: 2,
      company: 'InnovateTech Inc.',
      title: 'Senior Software Engineer',
      location: 'Austin, TX',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      duration: '2 years 10 months',
      isCurrent: false,
      impacts: [
        'Architected real-time data pipeline processing 1M+ events/day',
        'Implemented CI/CD reducing deployment time from 2 hours to 15 minutes',
        'Led team of 4 engineers delivering healthcare platform',
      ],
      techStack: ['React', 'Python', 'Kafka', 'PostgreSQL', 'Docker', 'GCP'],
    },
    {
      id: 3,
      company: 'StartupLabs',
      title: 'Software Engineer',
      location: 'Seattle, WA',
      startDate: 'Jun 2016',
      endDate: 'Feb 2019',
      duration: '2 years 9 months',
      isCurrent: false,
      impacts: [
        'Built e-commerce platform from scratch, reaching 100K users in first year',
        'Developed RESTful APIs serving 50K+ daily requests',
        'Introduced unit testing practices, achieving 80% code coverage',
      ],
      techStack: ['JavaScript', 'Node.js', 'MongoDB', 'Express', 'Redis', 'AWS'],
    },
  ];

  education: Education[] = [
    {
      institution: 'University of Technology',
      degree: 'Master of Science',
      field: 'Computer Science',
      year: '2016',
      achievements: [
        'Graduated with Distinction',
        'Thesis: Distributed Systems Architecture',
      ],
    },
    {
      institution: 'State Engineering College',
      degree: 'Bachelor of Engineering',
      field: 'Information Technology',
      year: '2014',
      achievements: ["Dean's List", 'Best Project Award'],
    },
  ];

  skillsTimeline: SkillsAtYear[] = [
    {
      year: '2016',
      skills: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'MongoDB', 'Git'],
    },
    {
      year: '2018',
      skills: [
        'JavaScript',
        'HTML',
        'CSS',
        'Node.js',
        'MongoDB',
        'Git',
        'React',
        'TypeScript',
        'Docker',
      ],
      newSkills: ['React', 'TypeScript', 'Docker'],
    },
    {
      year: '2020',
      skills: [
        'JavaScript',
        'TypeScript',
        'React',
        'Angular',
        'Node.js',
        'Python',
        'Docker',
        'Kubernetes',
        'AWS',
        'PostgreSQL',
      ],
      newSkills: ['Angular', 'Python', 'Kubernetes', 'AWS', 'PostgreSQL'],
    },
    {
      year: '2022',
      skills: [
        'TypeScript',
        'Angular',
        'React',
        'Nx',
        'Module Federation',
        'AWS',
        'GCP',
        'Terraform',
        'GraphQL',
        'Kafka',
      ],
      newSkills: ['Nx', 'Module Federation', 'GCP', 'Terraform', 'GraphQL', 'Kafka'],
    },
    {
      year: 'Now',
      skills: [
        'TypeScript',
        'Angular',
        'Nx',
        'Module Federation',
        'AI/ML',
        'LLMs',
        'System Design',
        'Cloud Architecture',
        'Team Leadership',
      ],
      newSkills: ['AI/ML', 'LLMs', 'System Design', 'Cloud Architecture', 'Team Leadership'],
    },
  ];

  currentSkills = computed(() => {
    const yearData = this.skillsTimeline.find(
      (s) => s.year === this.selectedSkillYear()
    );
    return yearData || this.skillsTimeline[this.skillsTimeline.length - 1];
  });

  ngOnInit(): void {
    // Initialize
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  selectSkillYear(year: string): void {
    this.selectedSkillYear.set(year);
  }

  isNewSkill(skill: string): boolean {
    const currentSkillData = this.currentSkills();
    return currentSkillData.newSkills?.includes(skill) || false;
  }

  private setupScrollAnimations(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const nodeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe cards
    setTimeout(() => {
      this.timelineCards?.forEach((card) => {
        cardObserver.observe(card.nativeElement);
      });

      this.timelineNodes?.forEach((node) => {
        nodeObserver.observe(node.nativeElement);
      });
    }, 100);

    // Timeline progress on scroll
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / docHeight) * 100, 100);
        this.timelineProgress.set(progress);
      });
    }
  }
}
