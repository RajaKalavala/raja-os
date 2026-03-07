import { Injectable, signal, computed } from '@angular/core';
import {
  Goal,
  Task,
  Idea,
  PlannerData,
  GoalWithProgress,
  Category,
  Priority,
  GoalStatus,
  TaskStatus,
} from '../models/planner.models';

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly storageKey = 'raja-os-planner';

  // Signals for reactive state
  readonly goals = signal<Goal[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly ideas = signal<Idea[]>([]);

  // Computed: goals with progress
  readonly goalsWithProgress = computed<GoalWithProgress[]>(() => {
    const allTasks = this.tasks();
    return this.goals().map((goal) => {
      const gTasks = allTasks.filter((t) => t.goalId === goal.id);
      const completedTasks = gTasks.filter((t) => t.status === 'done').length;
      const total = gTasks.length;
      return {
        ...goal,
        totalTasks: total,
        completedTasks,
        progress: total > 0 ? Math.round((completedTasks / total) * 100) : 0,
      };
    });
  });

  // Computed: summary stats
  readonly stats = computed(() => {
    const g = this.goals();
    const t = this.tasks();
    const i = this.ideas();
    return {
      goals: {
        total: g.length,
        active: g.filter((x) => x.status === 'active').length,
        completed: g.filter((x) => x.status === 'completed').length,
        onHold: g.filter((x) => x.status === 'on-hold').length,
      },
      tasks: {
        total: t.length,
        backlog: t.filter((x) => x.status === 'backlog').length,
        todo: t.filter((x) => x.status === 'todo').length,
        inProgress: t.filter((x) => x.status === 'in-progress').length,
        done: t.filter((x) => x.status === 'done').length,
      },
      ideas: {
        total: i.length,
      },
      overallProgress:
        t.length > 0
          ? Math.round(
              (t.filter((x) => x.status === 'done').length / t.length) * 100
            )
          : 0,
    };
  });

  constructor() {
    this.loadFromStorage();
  }

  // ─── Goal CRUD ──────────────────────────────────────────

  addGoal(data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Goal {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      dueDate: data.dueDate,
    };
    this.goals.update((list) => [...list, goal]);
    this.saveToStorage();
    return goal;
  }

  updateGoal(id: string, changes: Partial<Goal>): void {
    this.goals.update((list) =>
      list.map((g) =>
        g.id === id ? { ...g, ...changes, updatedAt: new Date().toISOString() } : g
      )
    );
    this.saveToStorage();
  }

  deleteGoal(id: string): void {
    this.tasks.update((list) => list.filter((t) => t.goalId !== id));
    this.goals.update((list) => list.filter((g) => g.id !== id));
    this.saveToStorage();
  }

  getGoal(id: string): Goal | undefined {
    return this.goals().find((g) => g.id === id);
  }

  // ─── Task CRUD ─────────────────────────────────────────────

  addTask(data: {
    goalId: string;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.generateId(),
      goalId: data.goalId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'backlog',
      createdAt: now,
      updatedAt: now,
      dueDate: data.dueDate,
    };
    this.tasks.update((list) => [...list, task]);
    this.saveToStorage();
    this.autoUpdateGoalStatus(task.goalId);
    return task;
  }

  updateTask(id: string, changes: Partial<Task>): void {
    const existing = this.tasks().find((t) => t.id === id);
    this.tasks.update((list) =>
      list.map((t) =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t
      )
    );
    this.saveToStorage();
    if (existing) {
      this.autoUpdateGoalStatus(existing.goalId);
    }
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  deleteTask(id: string): void {
    const task = this.tasks().find((t) => t.id === id);
    this.tasks.update((list) => list.filter((t) => t.id !== id));
    this.saveToStorage();
    if (task) {
      this.autoUpdateGoalStatus(task.goalId);
    }
  }

  getTasksForGoal(goalId: string): Task[] {
    return this.tasks().filter((t) => t.goalId === goalId);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  // ─── Auto Status Updates ───────────────────────────────────

  private autoUpdateGoalStatus(goalId: string): void {
    const goalTasks = this.tasks().filter((t) => t.goalId === goalId);
    if (goalTasks.length > 0) {
      const allTasksDone = goalTasks.every((t) => t.status === 'done');
      if (allTasksDone) {
        this.goals.update((list) =>
          list.map((g) =>
            g.id === goalId
              ? { ...g, status: 'completed' as GoalStatus, updatedAt: new Date().toISOString() }
              : g
          )
        );
      } else {
        const goal = this.goals().find((g) => g.id === goalId);
        if (goal?.status === 'completed') {
          this.goals.update((list) =>
            list.map((g) =>
              g.id === goalId
                ? { ...g, status: 'active' as GoalStatus, updatedAt: new Date().toISOString() }
                : g
            )
          );
        }
      }
    }
    this.saveToStorage();
  }

  // ─── Idea CRUD ───────────────────────────────────────────────

  addIdea(data: {
    title: string;
    notes?: string;
    category?: Category;
    priority?: Priority;
  }): Idea {
    const now = new Date().toISOString();
    const idea: Idea = {
      id: this.generateId(),
      title: data.title,
      notes: data.notes,
      category: data.category || 'personal',
      priority: data.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    };
    this.ideas.update((list) => [...list, idea]);
    this.saveToStorage();
    return idea;
  }

  updateIdea(id: string, changes: Partial<Idea>): void {
    this.ideas.update((list) =>
      list.map((i) =>
        i.id === id ? { ...i, ...changes, updatedAt: new Date().toISOString() } : i
      )
    );
    this.saveToStorage();
  }

  deleteIdea(id: string): void {
    this.ideas.update((list) => list.filter((i) => i.id !== id));
    this.saveToStorage();
  }

  // ─── Persistence ───────────────────────────────────────────

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        // Support legacy data: migrate missions -> goals, flatten milestones
        if (data.missions) {
          this.goals.set(data.missions.map((m: Goal & { id: string }) => ({
            ...m,
          })));
          // Migrate tasks: remove milestoneId, rename missionId to goalId
          const tasks = (data.tasks || []).map((t: Task & { missionId?: string; milestoneId?: string }) => ({
            ...t,
            goalId: t.goalId || t.missionId || '',
          }));
          this.tasks.set(tasks);
          this.ideas.set(data.ideas || []);
          // Save in new format
          this.saveToStorage();
        } else {
          this.goals.set(data.goals || []);
          this.tasks.set(data.tasks || []);
          this.ideas.set(data.ideas || []);
        }
      }
    } catch {
      console.warn('Failed to load planner data from localStorage');
    }
  }

  private saveToStorage(): void {
    try {
      const data: PlannerData = {
        goals: this.goals(),
        tasks: this.tasks(),
        ideas: this.ideas(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      console.warn('Failed to save planner data to localStorage');
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
