import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisMemoryService, JarvisMemory } from '@org/jarvis';

@Component({
  selector: 'raja-memory-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="memory-page">
      <div class="memory-header">
        <h2>Memory Manager</h2>
        <div class="header-actions">
          <span class="memory-count">{{ memories().length }} memories</span>
          <button class="add-btn" (click)="showAddForm.set(true)">+ Add Memory</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select class="filter-select" [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
          <option value="all">All Types</option>
          <option value="insight">Insights</option>
          <option value="pattern">Patterns</option>
          <option value="preference">Preferences</option>
          <option value="decision">Decisions</option>
          <option value="context">Context</option>
        </select>
        <select class="filter-select" [(ngModel)]="filterCategory" (ngModelChange)="applyFilters()">
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
          <option value="learning">Learning</option>
          <option value="habits">Habits</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      <!-- Add Form -->
      @if (showAddForm()) {
        <div class="add-form">
          <div class="form-row">
            <select class="form-input small" [(ngModel)]="newMemory.memoryType">
              <option value="context">Context</option>
              <option value="insight">Insight</option>
              <option value="pattern">Pattern</option>
              <option value="preference">Preference</option>
              <option value="decision">Decision</option>
            </select>
            <select class="form-input small" [(ngModel)]="newMemory.category">
              <option value="work">Work</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="personal">Personal</option>
              <option value="finance">Finance</option>
              <option value="habits">Habits</option>
            </select>
          </div>
          <textarea class="form-input" [(ngModel)]="newMemory.content" rows="3" placeholder="Memory content..."></textarea>
          <div class="form-actions">
            <button class="save-btn" (click)="addMemory()">Save</button>
            <button class="cancel-btn" (click)="showAddForm.set(false)">Cancel</button>
          </div>
        </div>
      }

      <!-- Memory List -->
      <div class="memory-list">
        @for (mem of filteredMemories(); track mem.id) {
          <div class="memory-card">
            <div class="memory-meta">
              <span class="memory-type" [attr.data-type]="mem.memoryType">{{ mem.memoryType }}</span>
              <span class="memory-category">{{ mem.category }}</span>
              <span class="memory-score">{{ mem.relevanceScore.toFixed(1) }}</span>
              <span class="memory-source">{{ mem.source }}</span>
            </div>
            <div class="memory-content">{{ mem.content }}</div>
            <div class="memory-footer">
              <span class="memory-date">{{ mem.createdAt | date:'medium' }}</span>
              <button class="delete-btn" (click)="deleteMemory(mem.id)">Delete</button>
            </div>
          </div>
        } @empty {
          <div class="empty">No memories found. Jarvis will learn about you over time.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .memory-page { max-width: 900px; margin: 0 auto; }

    .memory-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 20px; color: var(--jarvis-text, #e5e7eb); }
    }

    .header-actions { display: flex; gap: 12px; align-items: center; }
    .memory-count { font-size: 13px; color: var(--jarvis-text-muted, #6b7280); }

    .add-btn {
      padding: 8px 16px; border-radius: 6px; border: none;
      background: var(--jarvis-primary, #10b981); color: #000;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: var(--jarvis-font, monospace);
    }

    .filters {
      display: flex; gap: 8px; margin-bottom: 20px;
    }

    .filter-select {
      padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      background: var(--jarvis-surface, #111111);
      color: var(--jarvis-text, #e5e7eb);
      font-size: 13px; font-family: var(--jarvis-font, monospace);
      outline: none; cursor: pointer;
    }

    .add-form {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-primary, #10b981);
      border-radius: 10px; padding: 16px; margin-bottom: 20px;
    }
    .form-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .form-input {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      background: rgba(255,255,255,0.03); color: var(--jarvis-text, #e5e7eb);
      font-size: 13px; font-family: var(--jarvis-font, monospace);
      outline: none; box-sizing: border-box;
      &.small { width: auto; }
    }
    .form-actions { display: flex; gap: 8px; margin-top: 8px; }
    .save-btn { padding: 8px 16px; border-radius: 6px; border: none; background: var(--jarvis-primary, #10b981); color: #000; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--jarvis-font, monospace); }
    .cancel-btn { padding: 8px 16px; border-radius: 6px; border: 1px solid var(--jarvis-border, #1f1f1f); background: transparent; color: var(--jarvis-text-muted, #6b7280); font-size: 13px; cursor: pointer; font-family: var(--jarvis-font, monospace); }

    .memory-list { display: flex; flex-direction: column; gap: 10px; }

    .memory-card {
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 10px; padding: 14px;
    }

    .memory-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }

    .memory-type {
      padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      background: rgba(16,185,129,0.15); color: #10b981;
      &[data-type="insight"] { background: rgba(99,102,241,0.15); color: #6366f1; }
      &[data-type="pattern"] { background: rgba(251,191,36,0.15); color: #fbbf24; }
      &[data-type="preference"] { background: rgba(236,72,153,0.15); color: #ec4899; }
      &[data-type="decision"] { background: rgba(59,130,246,0.15); color: #3b82f6; }
    }

    .memory-category { font-size: 11px; color: var(--jarvis-text-muted, #6b7280); }
    .memory-score { font-size: 11px; color: var(--jarvis-primary, #10b981); }
    .memory-source { font-size: 11px; color: var(--jarvis-text-muted, #6b7280); font-style: italic; }

    .memory-content { font-size: 14px; line-height: 1.6; color: var(--jarvis-text, #e5e7eb); }

    .memory-footer {
      display: flex; justify-content: space-between; align-items: center; margin-top: 10px;
    }
    .memory-date { font-size: 11px; color: var(--jarvis-text-muted, #6b7280); }
    .delete-btn {
      padding: 4px 10px; border-radius: 4px; border: none;
      background: rgba(239,68,68,0.1); color: #ef4444;
      font-size: 11px; cursor: pointer; font-family: var(--jarvis-font, monospace);
      &:hover { background: rgba(239,68,68,0.2); }
    }

    .empty { text-align: center; padding: 40px; color: var(--jarvis-text-muted, #6b7280); font-size: 14px; }
  `],
})
export class MemoryManagerComponent implements OnInit {
  private memoryService = inject(JarvisMemoryService);

  memories = signal<JarvisMemory[]>([]);
  filteredMemories = signal<JarvisMemory[]>([]);
  showAddForm = signal(false);
  filterType = 'all';
  filterCategory = 'all';

  newMemory = {
    memoryType: 'context' as JarvisMemory['memoryType'],
    category: 'work' as JarvisMemory['category'],
    content: '',
  };

  async ngOnInit() {
    const list = await this.memoryService.getMemories();
    this.memories.set(list);
    this.filteredMemories.set(list);
  }

  applyFilters() {
    let list = this.memories();
    if (this.filterType !== 'all') list = list.filter(m => m.memoryType === this.filterType);
    if (this.filterCategory !== 'all') list = list.filter(m => m.category === this.filterCategory);
    this.filteredMemories.set(list);
  }

  async addMemory() {
    if (!this.newMemory.content.trim()) return;
    await this.memoryService.addMemory({
      memoryType: this.newMemory.memoryType,
      category: this.newMemory.category,
      content: this.newMemory.content.trim(),
      source: 'manual',
    });
    this.newMemory.content = '';
    this.showAddForm.set(false);
    const list = await this.memoryService.getMemories();
    this.memories.set(list);
    this.applyFilters();
  }

  async deleteMemory(id: string) {
    await this.memoryService.deleteMemory(id);
    this.memories.update(list => list.filter(m => m.id !== id));
    this.applyFilters();
  }
}
