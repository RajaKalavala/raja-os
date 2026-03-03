import { Injectable, signal, computed } from '@angular/core';
import {
  Mission,
  Milestone,
  Task,
  PlannerData,
  MissionWithProgress,
  MilestoneWithProgress,
  Category,
  Priority,
  MissionStatus,
  MilestoneStatus,
  TaskStatus,
} from '../models/planner.models';

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly storageKey = 'raja-os-planner';

  // Signals for reactive state
  readonly missions = signal<Mission[]>([]);
  readonly milestones = signal<Milestone[]>([]);
  readonly tasks = signal<Task[]>([]);

  // Computed: missions with progress
  readonly missionsWithProgress = computed<MissionWithProgress[]>(() => {
    const allMilestones = this.milestones();
    const allTasks = this.tasks();
    return this.missions().map((mission) => {
      const mMilestones = allMilestones.filter(
        (m) => m.missionId === mission.id
      );
      const mTasks = allTasks.filter((t) => t.missionId === mission.id);
      const completedMilestones = mMilestones.filter(
        (m) => m.status === 'completed'
      ).length;
      const completedTasks = mTasks.filter(
        (t) => t.status === 'done'
      ).length;
      const total = mTasks.length;
      return {
        ...mission,
        totalMilestones: mMilestones.length,
        completedMilestones,
        totalTasks: total,
        completedTasks,
        progress: total > 0 ? Math.round((completedTasks / total) * 100) : 0,
      };
    });
  });

  // Computed: summary stats
  readonly stats = computed(() => {
    const m = this.missions();
    const ms = this.milestones();
    const t = this.tasks();
    return {
      missions: {
        total: m.length,
        active: m.filter((x) => x.status === 'active').length,
        completed: m.filter((x) => x.status === 'completed').length,
        onHold: m.filter((x) => x.status === 'on-hold').length,
      },
      milestones: {
        total: ms.length,
        active: ms.filter((x) => x.status === 'active').length,
        completed: ms.filter((x) => x.status === 'completed').length,
        onHold: ms.filter((x) => x.status === 'on-hold').length,
      },
      tasks: {
        total: t.length,
        backlog: t.filter((x) => x.status === 'backlog').length,
        todo: t.filter((x) => x.status === 'todo').length,
        inProgress: t.filter((x) => x.status === 'in-progress').length,
        done: t.filter((x) => x.status === 'done').length,
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

  // ─── Mission CRUD ──────────────────────────────────────────

  addMission(data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Mission {
    const now = new Date().toISOString();
    const mission: Mission = {
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
    this.missions.update((list) => [...list, mission]);
    this.saveToStorage();
    return mission;
  }

  updateMission(id: string, changes: Partial<Mission>): void {
    this.missions.update((list) =>
      list.map((m) =>
        m.id === id ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m
      )
    );
    this.saveToStorage();
  }

  deleteMission(id: string): void {
    // Delete all associated milestones and tasks
    const milestoneIds = this.milestones()
      .filter((m) => m.missionId === id)
      .map((m) => m.id);
    this.tasks.update((list) =>
      list.filter((t) => t.missionId !== id)
    );
    this.milestones.update((list) =>
      list.filter((m) => m.missionId !== id)
    );
    this.missions.update((list) => list.filter((m) => m.id !== id));
    this.saveToStorage();
  }

  getMission(id: string): Mission | undefined {
    return this.missions().find((m) => m.id === id);
  }

  // ─── Milestone CRUD ────────────────────────────────────────

  addMilestone(data: {
    missionId: string;
    title: string;
    description: string;
    dueDate?: string;
  }): Milestone {
    const now = new Date().toISOString();
    const milestone: Milestone = {
      id: this.generateId(),
      missionId: data.missionId,
      title: data.title,
      description: data.description,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      dueDate: data.dueDate,
    };
    this.milestones.update((list) => [...list, milestone]);
    this.saveToStorage();
    return milestone;
  }

  updateMilestone(id: string, changes: Partial<Milestone>): void {
    this.milestones.update((list) =>
      list.map((m) =>
        m.id === id ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m
      )
    );
    this.saveToStorage();
  }

  deleteMilestone(id: string): void {
    this.tasks.update((list) =>
      list.filter((t) => t.milestoneId !== id)
    );
    this.milestones.update((list) => list.filter((m) => m.id !== id));
    this.saveToStorage();
  }

  getMilestonesForMission(missionId: string): MilestoneWithProgress[] {
    const allTasks = this.tasks();
    return this.milestones()
      .filter((m) => m.missionId === missionId)
      .map((milestone) => {
        const mTasks = allTasks.filter((t) => t.milestoneId === milestone.id);
        const completedTasks = mTasks.filter((t) => t.status === 'done').length;
        return {
          ...milestone,
          totalTasks: mTasks.length,
          completedTasks,
          progress:
            mTasks.length > 0
              ? Math.round((completedTasks / mTasks.length) * 100)
              : 0,
        };
      });
  }

  // ─── Task CRUD ─────────────────────────────────────────────

  addTask(data: {
    milestoneId: string;
    missionId: string;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    dueDate?: string;
  }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.generateId(),
      milestoneId: data.milestoneId,
      missionId: data.missionId,
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
    this.autoUpdateParentStatuses(task.milestoneId, task.missionId);
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
      this.autoUpdateParentStatuses(existing.milestoneId, existing.missionId);
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
      this.autoUpdateParentStatuses(task.milestoneId, task.missionId);
    }
  }

  getTasksForMilestone(milestoneId: string): Task[] {
    return this.tasks().filter((t) => t.milestoneId === milestoneId);
  }

  getTasksForMission(missionId: string): Task[] {
    return this.tasks().filter((t) => t.missionId === missionId);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  // ─── Auto Status Updates ───────────────────────────────────

  private autoUpdateParentStatuses(
    milestoneId: string,
    missionId: string
  ): void {
    // Auto-update milestone status
    const milestoneTasks = this.tasks().filter(
      (t) => t.milestoneId === milestoneId
    );
    if (milestoneTasks.length > 0) {
      const allDone = milestoneTasks.every((t) => t.status === 'done');
      if (allDone) {
        this.milestones.update((list) =>
          list.map((m) =>
            m.id === milestoneId
              ? { ...m, status: 'completed' as MilestoneStatus, updatedAt: new Date().toISOString() }
              : m
          )
        );
      } else {
        // If milestone was completed but tasks are no longer all done, reactivate
        const milestone = this.milestones().find((m) => m.id === milestoneId);
        if (milestone?.status === 'completed') {
          this.milestones.update((list) =>
            list.map((m) =>
              m.id === milestoneId
                ? { ...m, status: 'active' as MilestoneStatus, updatedAt: new Date().toISOString() }
                : m
            )
          );
        }
      }
    }

    // Auto-update mission status
    const missionMilestones = this.milestones().filter(
      (m) => m.missionId === missionId
    );
    const missionTasks = this.tasks().filter(
      (t) => t.missionId === missionId
    );
    if (missionTasks.length > 0) {
      const allTasksDone = missionTasks.every((t) => t.status === 'done');
      if (allTasksDone) {
        this.missions.update((list) =>
          list.map((m) =>
            m.id === missionId
              ? { ...m, status: 'completed' as MissionStatus, updatedAt: new Date().toISOString() }
              : m
          )
        );
      } else {
        const mission = this.missions().find((m) => m.id === missionId);
        if (mission?.status === 'completed') {
          this.missions.update((list) =>
            list.map((m) =>
              m.id === missionId
                ? { ...m, status: 'active' as MissionStatus, updatedAt: new Date().toISOString() }
                : m
            )
          );
        }
      }
    }

    this.saveToStorage();
  }

  // ─── Persistence ───────────────────────────────────────────

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const data: PlannerData = JSON.parse(raw);
        this.missions.set(data.missions || []);
        this.milestones.set(data.milestones || []);
        this.tasks.set(data.tasks || []);
      }
    } catch {
      console.warn('Failed to load planner data from localStorage');
    }
  }

  private saveToStorage(): void {
    try {
      const data: PlannerData = {
        missions: this.missions(),
        milestones: this.milestones(),
        tasks: this.tasks(),
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
