export type Category =
  | 'work'
  | 'personal'
  | 'health'
  | 'finance'
  | 'learning'
  | 'side-projects'
  | 'home';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type MissionStatus = 'active' | 'completed' | 'on-hold' | 'archived';

export type MilestoneStatus = 'active' | 'completed' | 'on-hold';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Milestone {
  id: string;
  missionId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  milestoneId: string;
  missionId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface PlannerData {
  missions: Mission[];
  milestones: Milestone[];
  tasks: Task[];
}

export interface MissionWithProgress extends Mission {
  totalMilestones: number;
  completedMilestones: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface MilestoneWithProgress extends Milestone {
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; bgColor: string }
> = {
  work: { label: 'Work', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  personal: { label: 'Personal', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  health: { label: 'Health', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  finance: { label: 'Finance', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  learning: { label: 'Learning', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  'side-projects': { label: 'Side Projects', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  home: { label: 'Home', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  critical: { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  high: { label: 'High', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  medium: { label: 'Medium', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  low: { label: 'Low', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
};

// ─── AI Brainstorm Types ─────────────────────────────────────

export interface AiPlanResponse {
  type: 'questions' | 'plan';
  message: string;
  questions?: string[];
  mission?: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
  };
  milestones?: {
    title: string;
    description: string;
    tasks: {
      title: string;
      description: string;
      priority: Priority;
      category: Category;
    }[];
  }[];
}

export interface BrainstormMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  plan?: AiPlanResponse;
}

export const BRAINSTORM_EXAMPLES = [
  'I want to build a personal fitness tracker web app',
  'Plan my AWS Solutions Architect certification preparation',
  'Organize a complete home renovation for my kitchen',
  'Create a monthly budget and savings plan',
  'Launch my side project SaaS product',
  'Learn React Native and build a mobile app',
];

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  backlog: { label: 'Backlog', color: '#6b7280' },
  todo: { label: 'To Do', color: '#3b82f6' },
  'in-progress': { label: 'In Progress', color: '#f97316' },
  done: { label: 'Done', color: '#22c55e' },
};
