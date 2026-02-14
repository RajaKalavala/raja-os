export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  isFeatured: boolean;
  isOpenSource: boolean;
  isProduction: boolean;
  thumbnail: {
    gradient: string;
    initials: string;
  };
  links: {
    github?: string;
    demo?: string;
  };
  date: string;
  teamSize: string;
  overview: string[];
  problem: string;
  role: string;
  features: { title: string; description: string }[];
  challenges: { challenge: string; solution: string }[];
  results: string[];
}

export type ProjectCategory =
  | 'All'
  | 'Web Apps'
  | 'APIs'
  | 'Open Source'
  | 'Architecture'
  | 'Full-Stack';
