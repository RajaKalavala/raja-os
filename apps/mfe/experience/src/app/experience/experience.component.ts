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
  totalProjects = signal<number>(5);

  roles: Role[] = [
    {
      id: 1,
      company: 'Dell Technologies',
      title: 'Principal Software Engineer',
      location: 'Bangalore, India',
      startDate: 'Jan 2022',
      endDate: null,
      duration: '3+ years',
      isCurrent: true,
      impacts: [
        'Led migration to microfrontend architecture using Module Federation',
        'Architected scalable enterprise solutions serving millions of users',
        'Mentored engineers and drove best practices across teams',
      ],
      techStack: [
        'Angular',
        'Nx',
        'TypeScript',
        'Module Federation',
        'Node.js',
      ],
      highlight: 'Leading enterprise-scale frontend architecture',
    },
    {
      id: 2,
      company: 'Siemens Healthineers',
      title: 'Design & Development Engineer',
      location: 'Bangalore, India',
      startDate: 'Jan 2019',
      endDate: 'Dec 2021',
      duration: '3 years',
      isCurrent: false,
      impacts: [
        'Developed healthcare platform solutions for medical imaging',
        'Implemented CI/CD pipelines improving deployment efficiency',
        'Collaborated with cross-functional teams on product development',
      ],
      techStack: ['Angular', 'TypeScript', 'C#', '.NET', 'Docker', 'Azure'],
    },
    {
      id: 3,
      company: 'Happiest Minds',
      title: 'Software Engineer',
      location: 'Bangalore, India',
      startDate: 'Jun 2016',
      endDate: 'Dec 2018',
      duration: '2.5 years',
      isCurrent: false,
      impacts: [
        'Built web applications and RESTful APIs for enterprise clients',
        'Developed frontend solutions using modern JavaScript frameworks',
        'Introduced unit testing practices and code quality standards',
      ],
      techStack: [
        'JavaScript',
        'Angular',
        'Node.js',
        'MongoDB',
        'Express',
        'Git',
      ],
    },
  ];

  education: Education[] = [
    {
      institution:
        'International Institute of Information Technology, Bangalore (IIIT-B)',
      degree: 'Post Graduate Program',
      field: 'Machine Learning and Artificial Intelligence',
      year: '2024 - 2025',
      achievements: [
        'Advanced ML/AI specialization',
        'Deep Learning & Neural Networks',
      ],
    },
    {
      institution: 'Centurion University of Technology and Management',
      degree: 'Bachelor of Technology (B.Tech)',
      field: 'Electronics and Communication Engineering',
      year: '2012 - 2016',
      achievements: [
        'Odisha, India',
        'Strong foundation in engineering principles',
      ],
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
      newSkills: [
        'Nx',
        'Module Federation',
        'GCP',
        'Terraform',
        'GraphQL',
        'Kafka',
      ],
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
      newSkills: [
        'AI/ML',
        'LLMs',
        'System Design',
        'Cloud Architecture',
        'Team Leadership',
      ],
    },
  ];

  currentSkills = computed(() => {
    const yearData = this.skillsTimeline.find(
      (s) => s.year === this.selectedSkillYear(),
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
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / docHeight) * 100, 100);
        this.timelineProgress.set(progress);
      });
    }
  }
}
