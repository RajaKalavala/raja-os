import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutomationService } from '../services/automation.service';
import { AutomationPost } from '../models/automation.model';

@Component({
  selector: 'app-automations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './automations.component.html',
  styleUrl: './automations.component.scss',
})
export class AutomationsComponent {
  readonly automationService = inject(AutomationService);

  // LinkedIn Post Generator state
  generatedPost = signal<string>('');
  isEditing = signal(false);
  editContent = '';
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Edit saved post
  editingPostId = signal<string | null>(null);
  editingPostContent = '';

  // Filter
  filterStatus = signal<'all' | 'draft' | 'posted'>('all');

  readonly filteredPosts = computed(() => {
    const posts = this.automationService.posts();
    const filter = this.filterStatus();
    if (filter === 'all') return posts;
    return posts.filter((p) => p.status === filter);
  });

  readonly draftCount = computed(() =>
    this.automationService.posts().filter((p) => p.status === 'draft').length
  );

  readonly postedCount = computed(() =>
    this.automationService.posts().filter((p) => p.status === 'posted').length
  );

  async generatePost() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.generatedPost.set('');

    if (!this.automationService.hasApiKey()) {
      this.errorMessage.set('OpenAI API key not found. Set it in Planner > Brainstorm settings first.');
      return;
    }

    try {
      const content = await this.automationService.generateLinkedInPost();
      this.generatedPost.set(content);
      this.editContent = content;
      this.isEditing.set(false);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to generate post.');
    }
  }

  enableEdit() {
    this.editContent = this.generatedPost();
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  applyEdit() {
    this.generatedPost.set(this.editContent);
    this.isEditing.set(false);
  }

  async savePost() {
    const content = this.generatedPost();
    if (!content) return;

    try {
      await this.automationService.savePost(content, 'linkedin');
      this.successMessage.set('Post saved as draft!');
      this.generatedPost.set('');
      this.clearMessagesAfterDelay();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  postToLinkedIn() {
    const content = this.generatedPost();
    if (!content) return;

    const encodedText = encodeURIComponent(content);
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
      '_blank'
    );
  }

  async saveAndPostToLinkedIn() {
    const content = this.generatedPost();
    if (!content) return;

    try {
      const post = await this.automationService.savePost(content, 'linkedin');
      await this.automationService.markAsPosted(post.id);
      this.successMessage.set('Post saved & opening LinkedIn...');
      this.generatedPost.set('');

      const encodedText = encodeURIComponent(content);
      window.open(
        `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
        '_blank'
      );
      this.clearMessagesAfterDelay();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to post.');
    }
  }

  // ─── Saved Posts Actions ──────────────────────────────────

  startEditPost(post: AutomationPost) {
    this.editingPostId.set(post.id);
    this.editingPostContent = post.content;
  }

  cancelEditPost() {
    this.editingPostId.set(null);
  }

  async saveEditPost(id: string) {
    try {
      await this.automationService.updatePost(id, this.editingPostContent);
      this.editingPostId.set(null);
      this.successMessage.set('Post updated!');
      this.clearMessagesAfterDelay();
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to update.');
    }
  }

  async deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    try {
      await this.automationService.deletePost(id);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to delete.');
    }
  }

  async repostToLinkedIn(post: AutomationPost) {
    if (post.status === 'draft') {
      await this.automationService.markAsPosted(post.id);
    }
    const encodedText = encodeURIComponent(post.content);
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
      '_blank'
    );
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage.set('');
      this.errorMessage.set('');
    }, 3000);
  }
}
