export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  tags: string[];
  coverImage?: string;
}

export type BlogTag =
  | 'All'
  | 'Architecture'
  | 'Angular'
  | 'System Design'
  | 'Career'
  | 'Tutorial';

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}
