import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogPost, BlogTag } from '../models/blog.model';
import { BLOGS_DATA } from '../data/blogs.data';

@Component({
  selector: 'raja-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  standalone: true,
  imports: [DatePipe],
})
export class BlogListComponent {
  searchQuery = signal<string>('');
  selectedTag = signal<BlogTag>('All');
  displayCount = signal<number>(5);

  tags: BlogTag[] = [
    'All',
    'Architecture',
    'Angular',
    'System Design',
    'Career',
    'Tutorial',
  ];

  allPosts: BlogPost[] = BLOGS_DATA;

  filteredPosts = computed(() => {
    let posts = this.allPosts;

    // Filter by tag
    const tag = this.selectedTag();
    if (tag !== 'All') {
      posts = posts.filter((p) => p.tags.includes(tag));
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return posts;
  });

  displayedPosts = computed(() => {
    return this.filteredPosts().slice(0, this.displayCount());
  });

  hasMorePosts = computed(() => {
    return this.filteredPosts().length > this.displayCount();
  });

  totalPosts = computed(() => this.allPosts.length);

  constructor(private router: Router) {}

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.displayCount.set(5);
  }

  selectTag(tag: BlogTag): void {
    this.selectedTag.set(tag);
    this.displayCount.set(5);
  }

  loadMore(): void {
    this.displayCount.update((count) => count + 5);
  }

  navigateToPost(slug: string): void {
    this.router.navigate(['/blogs', slug]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
