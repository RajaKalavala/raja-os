import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../services/planner.service';
import { AiService } from '../services/ai.service';
import {
  Category,
  Priority,
  TaskStatus,
  Goal,
  Task,
  Idea,
  BrainstormMessage,
  AiPlanResponse,
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  BRAINSTORM_EXAMPLES,
} from '../models/planner.models';

@Component({
  selector: 'raja-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent {
  readonly plannerService = inject(PlannerService);
  readonly stats = this.plannerService.stats;
  readonly goalsWithProgress = this.plannerService.goalsWithProgress;
  readonly categoryConfig = CATEGORY_CONFIG;
  readonly priorityConfig = PRIORITY_CONFIG;
  readonly taskStatusConfig = TASK_STATUS_CONFIG;
  readonly categories = Object.keys(CATEGORY_CONFIG) as Category[];
  readonly priorities = Object.keys(PRIORITY_CONFIG) as Priority[];
  readonly taskStatuses: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'done'];

  // AI Brainstorm
  readonly aiService = inject(AiService);
  readonly brainstormExamples = BRAINSTORM_EXAMPLES;
  brainstormInput = '';
  brainstormMessages = signal<BrainstormMessage[]>([]);
  isAiLoading = signal(false);
  latestPlan = signal<AiPlanResponse | null>(null);
  showApiKeyModal = signal(false);
  apiKeyInput = '';

  // View state
  activeTab = signal<'overview' | 'goals' | 'board' | 'ideas' | 'brainstorm'>('overview');
  expandedGoalId = signal<string | null>(null);

  // Modal state
  showGoalForm = signal(false);
  showTaskForm = signal(false);

  // Form context
  formGoalId = '';

  // Form data
  goalForm = {
    title: '',
    description: '',
    category: 'work' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
  };
  taskForm = {
    title: '',
    description: '',
    category: 'work' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
  };

  // Idea state
  newIdeaTitle = '';
  showIdeaForm = signal(false);
  editingIdeaId: string | null = null;
  ideaForm = {
    title: '',
    notes: '',
    category: 'personal' as Category,
    priority: 'medium' as Priority,
  };

  // Editing state
  editingGoalId: string | null = null;
  editingTaskId: string | null = null;

  // Kanban drag and drop
  draggedTaskId = signal<string | null>(null);
  dragOverColumn = signal<TaskStatus | null>(null);

  // Kanban filters
  kanbanFilterCategory = signal<Category | 'all'>('all');
  kanbanFilterGoal = signal<string>('all');

  readonly filteredTasks = computed(() => {
    let tasks = this.plannerService.tasks();
    const cat = this.kanbanFilterCategory();
    const goalId = this.kanbanFilterGoal();
    if (cat !== 'all') {
      tasks = tasks.filter((t) => t.category === cat);
    }
    if (goalId !== 'all') {
      tasks = tasks.filter((t) => t.goalId === goalId);
    }
    return tasks;
  });

  // Overview computed
  readonly activeGoals = computed(() =>
    this.goalsWithProgress().filter((g) => g.status === 'active' || g.status === 'on-hold')
  );

  readonly recentTasks = computed(() => {
    const tasks = this.plannerService.tasks();
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  });

  readonly inProgressGoals = computed(() =>
    this.goalsWithProgress().filter((g) => g.status === 'active')
  );

  readonly plannedGoals = computed(() =>
    this.goalsWithProgress().filter((g) => g.status === 'on-hold')
  );

  readonly completedGoals = computed(() =>
    this.goalsWithProgress().filter((g) => g.status === 'completed')
  );

  readonly categoryBreakdown = computed(() => {
    const tasks = this.plannerService.tasks();
    const breakdown: { category: Category; count: number; done: number }[] = [];
    for (const cat of this.categories) {
      const catTasks = tasks.filter((t) => t.category === cat);
      if (catTasks.length > 0) {
        breakdown.push({
          category: cat,
          count: catTasks.length,
          done: catTasks.filter((t) => t.status === 'done').length,
        });
      }
    }
    return breakdown.sort((a, b) => b.count - a.count);
  });

  tasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks().filter((t) => t.status === status);
  }

  // ─── Tab ───────────────────────────────────────────────────

  setTab(tab: 'overview' | 'goals' | 'board' | 'ideas' | 'brainstorm') {
    this.activeTab.set(tab);
  }

  // ─── Expand / Collapse ─────────────────────────────────────

  toggleGoal(id: string) {
    this.expandedGoalId.set(
      this.expandedGoalId() === id ? null : id
    );
  }

  // ─── Goal CRUD ──────────────────────────────────────────

  openGoalForm(goal?: Goal) {
    if (goal) {
      this.editingGoalId = goal.id;
      this.goalForm = {
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        dueDate: goal.dueDate || '',
      };
    } else {
      this.editingGoalId = null;
      this.goalForm = {
        title: '',
        description: '',
        category: 'work',
        priority: 'medium',
        dueDate: '',
      };
    }
    this.showGoalForm.set(true);
  }

  saveGoal() {
    if (!this.goalForm.title.trim()) return;
    if (this.editingGoalId) {
      this.plannerService.updateGoal(this.editingGoalId, {
        title: this.goalForm.title.trim(),
        description: this.goalForm.description.trim(),
        category: this.goalForm.category,
        priority: this.goalForm.priority,
        dueDate: this.goalForm.dueDate || undefined,
      });
    } else {
      this.plannerService.addGoal({
        title: this.goalForm.title.trim(),
        description: this.goalForm.description.trim(),
        category: this.goalForm.category,
        priority: this.goalForm.priority,
        dueDate: this.goalForm.dueDate || undefined,
      });
    }
    this.showGoalForm.set(false);
  }

  deleteGoal(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this goal and all its tasks?')) {
      this.plannerService.deleteGoal(id);
      if (this.expandedGoalId() === id) {
        this.expandedGoalId.set(null);
      }
    }
  }

  // ─── Task CRUD ─────────────────────────────────────────────

  openTaskForm(goalId: string, event: Event, task?: Task) {
    event.stopPropagation();
    this.formGoalId = goalId;
    const goal = this.plannerService.getGoal(goalId);
    if (task) {
      this.editingTaskId = task.id;
      this.taskForm = {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate || '',
      };
    } else {
      this.editingTaskId = null;
      this.taskForm = {
        title: '',
        description: '',
        category: goal?.category || 'work',
        priority: 'medium',
        dueDate: '',
      };
    }
    this.showTaskForm.set(true);
  }

  saveTask() {
    if (!this.taskForm.title.trim()) return;
    if (this.editingTaskId) {
      this.plannerService.updateTask(this.editingTaskId, {
        title: this.taskForm.title.trim(),
        description: this.taskForm.description.trim(),
        category: this.taskForm.category,
        priority: this.taskForm.priority,
        dueDate: this.taskForm.dueDate || undefined,
      });
    } else {
      this.plannerService.addTask({
        goalId: this.formGoalId,
        title: this.taskForm.title.trim(),
        description: this.taskForm.description.trim(),
        category: this.taskForm.category,
        priority: this.taskForm.priority,
        dueDate: this.taskForm.dueDate || undefined,
      });
    }
    this.showTaskForm.set(false);
  }

  deleteTask(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this task?')) {
      this.plannerService.deleteTask(id);
    }
  }

  onTaskStatusChange(taskId: string, status: TaskStatus) {
    this.plannerService.updateTaskStatus(taskId, status);
  }

  // ─── Drag and Drop ────────────────────────────────────────

  onDragStart(event: DragEvent, taskId: string) {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', taskId);
    }
  }

  onDragOver(event: DragEvent, status: TaskStatus) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn.set(status);
  }

  onDragLeave(status: TaskStatus) {
    if (this.dragOverColumn() === status) {
      this.dragOverColumn.set(null);
    }
  }

  onDrop(event: DragEvent, status: TaskStatus) {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    if (taskId) {
      this.plannerService.updateTaskStatus(taskId, status);
    }
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  onDragEnd() {
    this.draggedTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  // ─── Helpers ───────────────────────────────────────────────

  getGoalTitle(goalId: string): string {
    return this.plannerService.getGoal(goalId)?.title || '';
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showGoalForm.set(false);
      this.showTaskForm.set(false);
      this.showIdeaForm.set(false);
      this.showApiKeyModal.set(false);
    }
  }

  // ─── Ideas ──────────────────────────────────────────────────

  addQuickIdea() {
    if (!this.newIdeaTitle.trim()) return;
    this.plannerService.addIdea({ title: this.newIdeaTitle.trim() });
    this.newIdeaTitle = '';
  }

  openIdeaForm(idea?: Idea) {
    if (idea) {
      this.editingIdeaId = idea.id;
      this.ideaForm = {
        title: idea.title,
        notes: idea.notes || '',
        category: idea.category,
        priority: idea.priority,
      };
    } else {
      this.editingIdeaId = null;
      this.ideaForm = {
        title: '',
        notes: '',
        category: 'personal',
        priority: 'medium',
      };
    }
    this.showIdeaForm.set(true);
  }

  saveIdea() {
    if (!this.ideaForm.title.trim()) return;
    if (this.editingIdeaId) {
      this.plannerService.updateIdea(this.editingIdeaId, {
        title: this.ideaForm.title.trim(),
        notes: this.ideaForm.notes.trim() || undefined,
        category: this.ideaForm.category,
        priority: this.ideaForm.priority,
      });
    } else {
      this.plannerService.addIdea({
        title: this.ideaForm.title.trim(),
        notes: this.ideaForm.notes.trim() || undefined,
        category: this.ideaForm.category,
        priority: this.ideaForm.priority,
      });
    }
    this.showIdeaForm.set(false);
  }

  deleteIdea(id: string) {
    this.plannerService.deleteIdea(id);
  }

  convertIdeaToGoal(idea: Idea) {
    this.plannerService.addGoal({
      title: idea.title,
      description: idea.notes || '',
      category: idea.category,
      priority: idea.priority,
    });
    this.plannerService.deleteIdea(idea.id);
    this.activeTab.set('goals');
  }

  sendIdeaToBrainstorm(idea: Idea) {
    this.brainstormInput = idea.notes
      ? `${idea.title}\n${idea.notes}`
      : idea.title;
    this.plannerService.deleteIdea(idea.id);
    this.activeTab.set('brainstorm');
  }

  // ─── AI Brainstorm ─────────────────────────────────────────

  useExample(example: string) {
    this.brainstormInput = example;
  }

  onBrainstormKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitBrainstorm();
    }
  }

  async submitBrainstorm() {
    if (!this.brainstormInput.trim() || this.isAiLoading()) return;

    if (!this.aiService.hasApiKey()) {
      this.showApiKeyModal.set(true);
      return;
    }

    const userText = this.brainstormInput.trim();
    this.brainstormInput = '';

    this.brainstormMessages.update((msgs) => [
      ...msgs,
      {
        role: 'user' as const,
        content: userText,
        timestamp: new Date().toISOString(),
      },
    ]);

    this.isAiLoading.set(true);
    try {
      const response = await this.aiService.sendMessage(userText);

      this.brainstormMessages.update((msgs) => [
        ...msgs,
        {
          role: 'assistant' as const,
          content: response.message,
          timestamp: new Date().toISOString(),
          plan: response,
        },
      ]);

      if (response.type === 'plan') {
        this.latestPlan.set(response);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      this.brainstormMessages.update((msgs) => [
        ...msgs,
        {
          role: 'assistant' as const,
          content: `Error: ${message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    this.isAiLoading.set(false);
  }

  acceptPlan() {
    const plan = this.latestPlan();
    if (!plan?.goal || !plan.tasks) return;

    const goal = this.plannerService.addGoal({
      title: plan.goal.title,
      description: plan.goal.description,
      category: plan.goal.category,
      priority: plan.goal.priority,
    });

    for (const task of plan.tasks) {
      this.plannerService.addTask({
        goalId: goal.id,
        title: task.title,
        description: task.description,
        category: task.category || plan.goal.category,
        priority: task.priority,
      });
    }

    this.latestPlan.set(null);
    this.aiService.clearConversation();
    this.brainstormMessages.set([]);
    this.activeTab.set('goals');
    this.expandedGoalId.set(goal.id);
  }

  clearBrainstorm() {
    this.brainstormMessages.set([]);
    this.latestPlan.set(null);
    this.aiService.clearConversation();
    this.brainstormInput = '';
  }

  saveApiKey() {
    if (this.apiKeyInput.trim()) {
      this.aiService.setApiKey(this.apiKeyInput.trim());
      this.apiKeyInput = '';
      this.showApiKeyModal.set(false);
    }
  }

  removeApiKey() {
    this.aiService.removeApiKey();
  }
}
