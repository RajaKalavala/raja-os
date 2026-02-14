import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost, TableOfContentsItem } from '../models/blog.model';
import { BLOGS_DATA } from '../data/blogs.data';

@Component({
  selector: 'raja-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  standalone: true,
})
export class BlogDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('articleContent') articleContent!: ElementRef;

  post = signal<BlogPost | null>(null);
  tableOfContents = signal<TableOfContentsItem[]>([]);
  activeHeadingId = signal<string>('');
  linkCopied = signal<boolean>(false);

  allPosts: BlogPost[] = BLOGS_DATA;
  private scrollListener?: () => void;

  relatedPosts = computed(() => {
    const current = this.post();
    if (!current) return [];

    return this.allPosts
      .filter((p) => p.id !== current.id)
      .filter((p) => p.tags.some((t) => current.tags.includes(t)))
      .slice(0, 3);
  });

  previousPost = computed(() => {
    const current = this.post();
    if (!current) return null;

    const currentIndex = this.allPosts.findIndex((p) => p.id === current.id);
    if (currentIndex > 0) {
      return this.allPosts[currentIndex - 1];
    }
    return null;
  });

  nextPost = computed(() => {
    const current = this.post();
    if (!current) return null;

    const currentIndex = this.allPosts.findIndex((p) => p.id === current.id);
    if (currentIndex < this.allPosts.length - 1) {
      return this.allPosts[currentIndex + 1];
    }
    return null;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        const foundPost = this.allPosts.find((p) => p.slug === slug);
        if (foundPost) {
          this.post.set(foundPost);
          window.scrollTo(0, 0);
        } else {
          this.router.navigate(['/blogs']);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.generateTableOfContents();
      this.setupScrollSpy();
      this.setupCodeCopyButtons();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  goBack(): void {
    this.router.navigate(['/blogs']);
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

  parseMarkdown(content: string): string {
    if (!content) return '';

    let html = content;

    // Code blocks with language
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) => {
        const language = lang || 'text';
        const escapedCode = this.escapeHtml(code.trim());
        return `<div class="code-block" data-language="${language}">
          <div class="code-header">
            <span class="code-language">${language}</span>
            <button class="copy-btn" aria-label="Copy code">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <pre><code class="language-${language}">${escapedCode}</code></pre>
        </div>`;
      }
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="inline-code">$1</code>'
    );

    // Headers with IDs
    html = html.replace(/^## (.*$)/gm, (_, text) => {
      const id = this.slugify(text);
      return `<h2 id="${id}">${text}</h2>`;
    });

    html = html.replace(/^### (.*$)/gm, (_, text) => {
      const id = this.slugify(text);
      return `<h3 id="${id}">${text}</h3>`;
    });

    // Blockquotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote>$1</blockquote>'
    );

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // Unordered lists
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs
    html = html
      .split('\n\n')
      .map((block) => {
        if (
          block.startsWith('<h') ||
          block.startsWith('<ul') ||
          block.startsWith('<ol') ||
          block.startsWith('<blockquote') ||
          block.startsWith('<div') ||
          block.startsWith('<hr') ||
          block.trim() === ''
        ) {
          return block;
        }
        return `<p>${block.replace(/\n/g, ' ')}</p>`;
      })
      .join('\n');

    return html;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private generateTableOfContents(): void {
    const content = this.post()?.content;
    if (!content) return;

    const headings: TableOfContentsItem[] = [];
    const h2Regex = /^## (.*)$/gm;
    const h3Regex = /^### (.*)$/gm;

    let match;
    while ((match = h2Regex.exec(content)) !== null) {
      headings.push({
        id: this.slugify(match[1]),
        text: match[1],
        level: 2,
      });
    }

    while ((match = h3Regex.exec(content)) !== null) {
      headings.push({
        id: this.slugify(match[1]),
        text: match[1],
        level: 3,
      });
    }

    // Sort by position in content
    headings.sort((a, b) => {
      const posA = content.indexOf(a.text);
      const posB = content.indexOf(b.text);
      return posA - posB;
    });

    this.tableOfContents.set(headings);
  }

  private setupScrollSpy(): void {
    this.scrollListener = () => {
      const headings = this.tableOfContents();
      if (headings.length === 0) return;

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            this.activeHeadingId.set(headings[i].id);
            return;
          }
        }
      }

      this.activeHeadingId.set(headings[0]?.id || '');
    };

    window.addEventListener('scroll', this.scrollListener);
  }

  private setupCodeCopyButtons(): void {
    setTimeout(() => {
      const copyButtons = document.querySelectorAll('.copy-btn');
      copyButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const codeBlock = (btn as HTMLElement).closest('.code-block');
          const code = codeBlock?.querySelector('code')?.textContent || '';
          navigator.clipboard.writeText(code).then(() => {
            const span = btn.querySelector('span');
            if (span) {
              span.textContent = 'Copied!';
              setTimeout(() => {
                span.textContent = 'Copy';
              }, 2000);
            }
          });
        });
      });
    }, 200);
  }

  scrollToHeading(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => {
        this.linkCopied.set(false);
      }, 2000);
    });
  }

  shareOnTwitter(): void {
    const post = this.post();
    if (!post) return;

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank'
    );
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank'
    );
  }
}
