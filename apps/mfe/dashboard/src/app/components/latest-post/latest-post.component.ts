import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BlogPost {
  title: string;
  date: string;
  readTime: string;
  slug: string;
}

@Component({
  selector: 'app-latest-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest-post.component.html',
  styleUrl: './latest-post.component.scss',
})
export class LatestPostComponent {
  latestPost: BlogPost = {
    title: 'Building a Microfrontend OS with Angular',
    date: 'Feb 8, 2026',
    readTime: '8 min read',
    slug: '/blogs/microfrontend-os-angular',
  };

  navigateToPost() {
    // In a real app, this would use Router
    window.location.href = this.latestPost.slug;
  }
}
