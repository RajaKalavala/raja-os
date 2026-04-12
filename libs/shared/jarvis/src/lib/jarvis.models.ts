export interface JarvisMemory {
  id: string;
  userId: string;
  memoryType: 'insight' | 'pattern' | 'preference' | 'decision' | 'context';
  category: 'work' | 'health' | 'finance' | 'learning' | 'habits' | 'personal';
  content: string;
  source: 'chat' | 'briefing' | 'review' | 'manual';
  relevanceScore: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JarvisBriefing {
  id: string;
  userId: string;
  briefingDate: string;
  topPriority: string;
  aiInsight: string;
  rawData: BriefingRawData;
  generatedAt: Date;
}

export interface BriefingRawData {
  activeGoals: number;
  tasksDueToday: number;
  overdueTasksCount: number;
  habitStreaks: HabitStreak[];
  pendingCaptures: number;
  daysSinceLastPost: number;
  lastFocusSession: string | null;
}

export interface JarvisHabit {
  id: string;
  userId: string;
  name: string;
  category: 'health' | 'learning' | 'work' | 'personal';
  frequency: 'daily' | 'weekdays' | 'weekly';
  targetCount: number;
  color: string;
  icon: string;
  isActive: boolean;
  currentStreak?: number;
  longestStreak?: number;
  todayCompleted?: boolean;
}

export interface HabitStreak {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  loggedDate: string;
  completed: boolean;
  notes: string | null;
  loggedAt: Date;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskDescription: string;
  goalId: string | null;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  status: 'active' | 'completed' | 'abandoned';
  completionNotes: string | null;
  blockers: string | null;
  focusRating: number | null;
  startedAt: Date;
  endedAt: Date | null;
}

export interface LifeMetrics {
  weekNumber: number;
  year: number;
  work: number;
  health: number;
  learning: number;
  sideProject: number;
  finance: number;
  brand: number;
  overall: number;
  previousWeek?: LifeMetrics;
}

export interface JarvisCapture {
  id: string;
  userId: string;
  rawInput: string;
  classifiedType: 'idea' | 'task' | 'goal' | 'note' | 'reminder' | null;
  classifiedCategory: string | null;
  aiSummary: string | null;
  routedTo: string | null;
  routedId: string | null;
  status: 'pending' | 'routed' | 'dismissed';
  createdAt: Date;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  reviewDate: string;
  weekStart: string;
  weekEnd: string;
  wins: string;
  challenges: string;
  shipped: string;
  missed: string;
  habitSummary: Record<string, number[]>;
  goalProgress: Record<string, number>;
  aiReflection: string;
  linkedinDraft: string;
}

export interface JarvisChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface JarvisNudge {
  id: string;
  type: NudgeType;
  message: string;
  actionLabel: string;
  actionRoute: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  isDismissed: boolean;
  snoozedUntil: Date | null;
  createdAt: Date;
}

export type NudgeType =
  | 'post_overdue'
  | 'goal_overdue'
  | 'habit_streak_at_risk'
  | 'ideas_aging'
  | 'no_focus_session'
  | 'weekly_review_due'
  | 'goal_completed'
  | 'medication_reminder'
  | 'labs_out_of_range'
  | 'health_log_missing'
  | 'vitals_data_stale'
  | 'health_goal_at_risk'
  | 'apple_health_import_due';
