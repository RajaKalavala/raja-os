import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../services/planner.service';
import { AiService } from '../services/ai.service';
import {
  Category,
  Priority,
  TaskStatus,
  Mission,
  Milestone,
  Task,
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
  readonly missionsWithProgress = this.plannerService.missionsWithProgress;
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
  activeTab = signal<'overview' | 'board' | 'brainstorm'>('overview');
  expandedMissionId = signal<string | null>(null);
  expandedMilestoneId = signal<string | null>(null);

  // Modal state
  showMissionForm = signal(false);
  showMilestoneForm = signal(false);
  showTaskForm = signal(false);

  // Form context
  formMissionId = '';
  formMilestoneId = '';

  // Form data
  missionForm = {
    title: '',
    description: '',
    category: 'work' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
  };
  milestoneForm = { title: '', description: '', dueDate: '' };
  taskForm = {
    title: '',
    description: '',
    category: 'work' as Category,
    priority: 'medium' as Priority,
    dueDate: '',
  };

  // Editing state
  editingMissionId: string | null = null;
  editingMilestoneId: string | null = null;
  editingTaskId: string | null = null;

  // Kanban drag and drop
  draggedTaskId = signal<string | null>(null);
  dragOverColumn = signal<TaskStatus | null>(null);

  // Kanban filters
  kanbanFilterCategory = signal<Category | 'all'>('all');
  kanbanFilterMission = signal<string>('all');

  readonly filteredTasks = computed(() => {
    let tasks = this.plannerService.tasks();
    const cat = this.kanbanFilterCategory();
    const missionId = this.kanbanFilterMission();
    if (cat !== 'all') {
      tasks = tasks.filter((t) => t.category === cat);
    }
    if (missionId !== 'all') {
      tasks = tasks.filter((t) => t.missionId === missionId);
    }
    return tasks;
  });

  tasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks().filter((t) => t.status === status);
  }

  // ─── Tab ───────────────────────────────────────────────────

  setTab(tab: 'overview' | 'board' | 'brainstorm') {
    this.activeTab.set(tab);
  }

  // ─── Expand / Collapse ─────────────────────────────────────

  toggleMission(id: string) {
    this.expandedMissionId.set(
      this.expandedMissionId() === id ? null : id
    );
    this.expandedMilestoneId.set(null);
  }

  toggleMilestone(id: string) {
    this.expandedMilestoneId.set(
      this.expandedMilestoneId() === id ? null : id
    );
  }

  // ─── Mission CRUD ──────────────────────────────────────────

  openMissionForm(mission?: Mission) {
    if (mission) {
      this.editingMissionId = mission.id;
      this.missionForm = {
        title: mission.title,
        description: mission.description,
        category: mission.category,
        priority: mission.priority,
        dueDate: mission.dueDate || '',
      };
    } else {
      this.editingMissionId = null;
      this.missionForm = {
        title: '',
        description: '',
        category: 'work',
        priority: 'medium',
        dueDate: '',
      };
    }
    this.showMissionForm.set(true);
  }

  saveMission() {
    if (!this.missionForm.title.trim()) return;
    if (this.editingMissionId) {
      this.plannerService.updateMission(this.editingMissionId, {
        title: this.missionForm.title.trim(),
        description: this.missionForm.description.trim(),
        category: this.missionForm.category,
        priority: this.missionForm.priority,
        dueDate: this.missionForm.dueDate || undefined,
      });
    } else {
      this.plannerService.addMission({
        title: this.missionForm.title.trim(),
        description: this.missionForm.description.trim(),
        category: this.missionForm.category,
        priority: this.missionForm.priority,
        dueDate: this.missionForm.dueDate || undefined,
      });
    }
    this.showMissionForm.set(false);
  }

  deleteMission(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this mission and all its milestones/tasks?')) {
      this.plannerService.deleteMission(id);
      if (this.expandedMissionId() === id) {
        this.expandedMissionId.set(null);
      }
    }
  }

  // ─── Milestone CRUD ────────────────────────────────────────

  openMilestoneForm(missionId: string, event: Event, milestone?: Milestone) {
    event.stopPropagation();
    this.formMissionId = missionId;
    if (milestone) {
      this.editingMilestoneId = milestone.id;
      this.milestoneForm = {
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate || '',
      };
    } else {
      this.editingMilestoneId = null;
      this.milestoneForm = { title: '', description: '', dueDate: '' };
    }
    this.showMilestoneForm.set(true);
  }

  saveMilestone() {
    if (!this.milestoneForm.title.trim()) return;
    if (this.editingMilestoneId) {
      this.plannerService.updateMilestone(this.editingMilestoneId, {
        title: this.milestoneForm.title.trim(),
        description: this.milestoneForm.description.trim(),
        dueDate: this.milestoneForm.dueDate || undefined,
      });
    } else {
      this.plannerService.addMilestone({
        missionId: this.formMissionId,
        title: this.milestoneForm.title.trim(),
        description: this.milestoneForm.description.trim(),
        dueDate: this.milestoneForm.dueDate || undefined,
      });
    }
    this.showMilestoneForm.set(false);
  }

  deleteMilestone(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this milestone and all its tasks?')) {
      this.plannerService.deleteMilestone(id);
    }
  }

  // ─── Task CRUD ─────────────────────────────────────────────

  openTaskForm(
    missionId: string,
    milestoneId: string,
    event: Event,
    task?: Task
  ) {
    event.stopPropagation();
    this.formMissionId = missionId;
    this.formMilestoneId = milestoneId;
    const mission = this.plannerService.getMission(missionId);
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
        category: mission?.category || 'work',
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
        missionId: this.formMissionId,
        milestoneId: this.formMilestoneId,
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

  getMissionTitle(missionId: string): string {
    return this.plannerService.getMission(missionId)?.title || '';
  }

  getMilestoneTitle(milestoneId: string): string {
    return this.plannerService.getMilestone(milestoneId)?.title || '';
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showMissionForm.set(false);
      this.showMilestoneForm.set(false);
      this.showTaskForm.set(false);
      this.showApiKeyModal.set(false);
    }
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
    if (!plan?.mission || !plan.milestones) return;

    const mission = this.plannerService.addMission({
      title: plan.mission.title,
      description: plan.mission.description,
      category: plan.mission.category,
      priority: plan.mission.priority,
    });

    for (const ms of plan.milestones) {
      const milestone = this.plannerService.addMilestone({
        missionId: mission.id,
        title: ms.title,
        description: ms.description,
      });

      for (const task of ms.tasks) {
        this.plannerService.addTask({
          missionId: mission.id,
          milestoneId: milestone.id,
          title: task.title,
          description: task.description,
          category: task.category || plan.mission.category,
          priority: task.priority,
        });
      }
    }

    this.latestPlan.set(null);
    this.aiService.clearConversation();
    this.brainstormMessages.set([]);
    this.activeTab.set('overview');
    this.expandedMissionId.set(mission.id);
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
