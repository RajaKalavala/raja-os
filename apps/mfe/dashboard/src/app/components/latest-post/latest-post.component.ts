import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
  tags: string[];
}

@Component({
  selector: 'app-latest-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest-post.component.html',
  styleUrl: './latest-post.component.scss',
})
export class LatestPostComponent {
  private router = inject(Router);

  // Latest post from blogs data - keeping in sync manually
  // In a real app, this would come from a shared service or API
  latestPost: BlogPost = {
    title: 'Why I Built My Portfolio as an Operating System',
    excerpt:
      'Traditional portfolios are boring. I wanted to create something that showcases not just my work, but my thinking about software architecture.',
    date: 'Jan 15, 2025',
    readTime: '8 min read',
    slug: 'why-i-built-my-portfolio-as-an-operating-system',
    tags: ['Architecture', 'Career'],
  };

  navigateToPost(): void {
    // Navigate to /blogs/:slug - use absolute path for cross-MFE navigation
    this.router.navigate(['/blogs', this.latestPost.slug]);
  }
}
