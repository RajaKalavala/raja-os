import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SupabaseService } from '@org/supabase';
import {
  Goal,
  Task,
  Idea,
  GoalWithProgress,
  Category,
  Priority,
  GoalStatus,
  TaskStatus,
} from '../models/planner.models';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly supabase = inject(SupabaseService);

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
    effect(() => {
      const user = this.supabase.currentUser();
      if (user) {
        this.loadFromDatabase();
      } else {
        this.goals.set([]);
        this.tasks.set([]);
        this.ideas.set([]);
      }
    });
  }

  // ─── Row Mappers ──────────────────────────────────────────

  private toGoal(row: any): Goal {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined,
    };
  }

  private toTask(row: any): Task {
    return {
      id: row.id,
      goalId: row.goal_id,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      dueDate: row.due_date || undefined,
    };
  }

  private toIdea(row: any): Idea {
    return {
      id: row.id,
      title: row.title,
      notes: row.notes || undefined,
      category: row.category,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ─── Load from Database ───────────────────────────────────

  private async loadFromDatabase(): Promise<void> {
    const client = this.supabase.client;
    const [goalsRes, tasksRes, ideasRes] = await Promise.all([
      client.from('planner_goals').select('*').order('created_at', { ascending: true }),
      client.from('planner_tasks').select('*').order('created_at', { ascending: true }),
      client.from('planner_ideas').select('*').order('created_at', { ascending: true }),
    ]);

    this.goals.set((goalsRes.data || []).map((r) => this.toGoal(r)));
    this.tasks.set((tasksRes.data || []).map((r) => this.toTask(r)));
    this.ideas.set((ideasRes.data || []).map((r) => this.toIdea(r)));
  }

  // ─── Goal CRUD ──────────────────────────────────────────

  async addGoal(data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Promise<Goal> {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await this.supabase.client
      .from('planner_goals')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'active',
        due_date: data.dueDate || null,
      })
      .select()
      .single();

    if (error) throw error;
    const goal = this.toGoal(row);
    this.goals.update((list) => [...list, goal]);
    return goal;
  }

  async updateGoal(id: string, changes: Partial<Goal>): Promise<void> {
    const dbChanges: any = {};
    if (changes.title !== undefined) dbChanges.title = changes.title;
    if (changes.description !== undefined) dbChanges.description = changes.description;
    if (changes.category !== undefined) dbChanges.category = changes.category;
    if (changes.priority !== undefined) dbChanges.priority = changes.priority;
    if (changes.status !== undefined) dbChanges.status = changes.status;
    if (changes.dueDate !== undefined) dbChanges.due_date = changes.dueDate || null;

    const { error } = await this.supabase.client
      .from('planner_goals')
      .update(dbChanges)
      .eq('id', id);

    if (error) throw error;

    this.goals.update((list) =>
      list.map((g) =>
        g.id === id ? { ...g, ...changes, updatedAt: new Date().toISOString() } : g
      )
    );
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('planner_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Tasks are cascade-deleted in DB, update local state
    this.tasks.update((list) => list.filter((t) => t.goalId !== id));
    this.goals.update((list) => list.filter((g) => g.id !== id));
  }

  getGoal(id: string): Goal | undefined {
    return this.goals().find((g) => g.id === id);
  }

  // ─── Task CRUD ─────────────────────────────────────────────

  async addTask(data: {
    goalId: string;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Promise<Task> {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await this.supabase.client
      .from('planner_tasks')
      .insert({
        user_id: userId,
        goal_id: data.goalId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'backlog',
        due_date: data.dueDate || null,
      })
      .select()
      .single();

    if (error) throw error;
    const task = this.toTask(row);
    this.tasks.update((list) => [...list, task]);
    await this.autoUpdateGoalStatus(task.goalId);
    return task;
  }

  async updateTask(id: string, changes: Partial<Task>): Promise<void> {
    const existing = this.tasks().find((t) => t.id === id);
    const dbChanges: any = {};
    if (changes.title !== undefined) dbChanges.title = changes.title;
    if (changes.description !== undefined) dbChanges.description = changes.description;
    if (changes.category !== undefined) dbChanges.category = changes.category;
    if (changes.priority !== undefined) dbChanges.priority = changes.priority;
    if (changes.status !== undefined) dbChanges.status = changes.status;
    if (changes.dueDate !== undefined) dbChanges.due_date = changes.dueDate || null;

    const { error } = await this.supabase.client
      .from('planner_tasks')
      .update(dbChanges)
      .eq('id', id);

    if (error) throw error;

    this.tasks.update((list) =>
      list.map((t) =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t
      )
    );

    if (existing) {
      await this.autoUpdateGoalStatus(existing.goalId);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    await this.updateTask(id, { status });
  }

  async deleteTask(id: string): Promise<void> {
    const task = this.tasks().find((t) => t.id === id);

    const { error } = await this.supabase.client
      .from('planner_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    this.tasks.update((list) => list.filter((t) => t.id !== id));
    if (task) {
      await this.autoUpdateGoalStatus(task.goalId);
    }
  }

  getTasksForGoal(goalId: string): Task[] {
    return this.tasks().filter((t) => t.goalId === goalId);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  // ─── Auto Status Updates ───────────────────────────────────

  private async autoUpdateGoalStatus(goalId: string): Promise<void> {
    const goalTasks = this.tasks().filter((t) => t.goalId === goalId);
    if (goalTasks.length > 0) {
      const allTasksDone = goalTasks.every((t) => t.status === 'done');
      if (allTasksDone) {
        await this.updateGoal(goalId, { status: 'completed' as GoalStatus });
      } else {
        const goal = this.goals().find((g) => g.id === goalId);
        if (goal?.status === 'completed') {
          await this.updateGoal(goalId, { status: 'active' as GoalStatus });
        }
      }
    }
  }

  // ─── Idea CRUD ───────────────────────────────────────────────

  async addIdea(data: {
    title: string;
    notes?: string;
    category?: Category;
    priority?: Priority;
  }): Promise<Idea> {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await this.supabase.client
      .from('planner_ideas')
      .insert({
        user_id: userId,
        title: data.title,
        notes: data.notes || null,
        category: data.category || 'personal',
        priority: data.priority || 'medium',
      })
      .select()
      .single();

    if (error) throw error;
    const idea = this.toIdea(row);
    this.ideas.update((list) => [...list, idea]);
    return idea;
  }

  async updateIdea(id: string, changes: Partial<Idea>): Promise<void> {
    const dbChanges: any = {};
    if (changes.title !== undefined) dbChanges.title = changes.title;
    if (changes.notes !== undefined) dbChanges.notes = changes.notes || null;
    if (changes.category !== undefined) dbChanges.category = changes.category;
    if (changes.priority !== undefined) dbChanges.priority = changes.priority;

    const { error } = await this.supabase.client
      .from('planner_ideas')
      .update(dbChanges)
      .eq('id', id);

    if (error) throw error;

    this.ideas.update((list) =>
      list.map((i) =>
        i.id === id ? { ...i, ...changes, updatedAt: new Date().toISOString() } : i
      )
    );
  }

  async deleteIdea(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('planner_ideas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.ideas.update((list) => list.filter((i) => i.id !== id));
  }
}
