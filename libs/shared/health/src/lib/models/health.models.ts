// ========================================
// Health Vital Metrics
// ========================================

export interface HealthVital {
  id: string;
  userId: string;
  metricType: string;
  value: number;
  unit: string;
  source: 'apple_health' | 'manual' | 'device';
  deviceName: string | null;
  recordedAt: Date;
  createdAt: Date;
}

export interface VitalPoint {
  date: Date;
  value: number;
}

export interface MetricSeries {
  metricType: string;
  label: string;
  unit: string;
  points: VitalPoint[];
}

// ========================================
// Medical Documents
// ========================================

export type HealthDocumentType =
  | 'lab_report'
  | 'imaging'
  | 'prescription'
  | 'discharge_summary'
  | 'referral'
  | 'insurance'
  | 'vaccination'
  | 'other';

export interface HealthDocument {
  id: string;
  userId: string;
  title: string;
  documentType: HealthDocumentType;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number | null;
  bodySystems: string[];
  documentDate: string | null;
  providerName: string | null;
  facilityName: string | null;
  tags: string[];
  aiExtractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  aiSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  extractionType: string;
  label: string;
  value: string;
  valueNumeric: number | null;
  unit: string | null;
  referenceRangeLow: number | null;
  referenceRangeHigh: number | null;
  isFlagged: boolean;
  flagDirection: 'high' | 'low' | null;
  bodySystem: string | null;
  confidence: number;
}

export interface DocumentAnalysisExtraction {
  type: string;
  label: string;
  value: string;
  valueNumeric: number | null;
  unit: string | null;
  referenceRangeLow: number | null;
  referenceRangeHigh: number | null;
  isFlagged: boolean;
  flagDirection: 'high' | 'low' | null;
  bodySystem: string | null;
  confidence: number;
}

export interface DocumentAnalysis {
  summary: string;
  documentType: HealthDocumentType;
  documentDate: string | null;
  providerName: string | null;
  facilityName: string | null;
  bodySystems: string[];
  extractions: DocumentAnalysisExtraction[];
}

// ========================================
// Lab Results
// ========================================

export interface LabResult {
  id: string;
  userId: string;
  documentId: string | null;
  biomarkerName: string;
  biomarkerKey: string;
  panel: string | null;
  value: number;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  isFlagged: boolean;
  flagDirection: 'high' | 'low' | 'critical_high' | 'critical_low' | null;
  labDate: string;
  labName: string | null;
  orderedBy: string | null;
  notes: string | null;
}

// ========================================
// Medications & Supplements
// ========================================

export interface Medication {
  id: string;
  userId: string;
  name: string;
  category: 'medication' | 'supplement' | 'vitamin' | 'otc';
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  route: string | null;
  prescribedBy: string | null;
  prescribedFor: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderTimes: string[];
  notes: string | null;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  logDate: string;
  taken: boolean;
  takenAt: Date | null;
  skippedReason: string | null;
}

// ========================================
// Daily Health Log
// ========================================

export interface DailyHealthLog {
  id: string;
  userId: string;
  logDate: string;
  moodScore: number | null;
  energyScore: number | null;
  stressScore: number | null;
  sleepQuality: number | null;
  symptoms: string[];
  notes: string | null;
}

// ========================================
// Health Profile (Emergency Card)
// ========================================

export interface HealthProfile {
  id: string;
  userId: string;
  bloodType: string | null;
  allergies: AllergyEntry[];
  chronicConditions: string[];
  primaryPhysician: PhysicianContact | null;
  emergencyContacts: EmergencyContact[];
  insurance: InsuranceInfo | null;
  organDonor: boolean | null;
  heightCm: number | null;
  dateOfBirth: string | null;
}

export interface AllergyEntry {
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface PhysicianContact {
  name: string;
  phone: string;
  clinic: string;
  specialty?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber: string;
}

// ========================================
// Health Goals
// ========================================

export interface HealthGoal {
  id: string;
  userId: string;
  title: string;
  category: 'weight' | 'fitness' | 'nutrition' | 'sleep' | 'lab_target' | 'habit' | 'mental_health';
  metricType: string | null;
  biomarkerKey: string | null;
  targetValue: number | null;
  targetUnit: string | null;
  baselineValue: number | null;
  currentValue: number | null;
  deadline: string | null;
  status: 'active' | 'achieved' | 'paused' | 'abandoned';
  notes: string | null;
}

// ========================================
// Health Chat
// ========================================

export interface HealthChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed: string | null;
  sessionId: string;
  createdAt: Date;
}

// ========================================
// Health Score
// ========================================

export interface HealthScore {
  total: number;
  sleep: number;
  activity: number;
  hrv: number;
  labs: number;
  medication: number;
  wellbeing: number;
  computedAt: Date;
}

// ========================================
// AI Types
// ========================================

export interface CorrelationInsight {
  correlationStrength: 'strong' | 'moderate' | 'weak' | 'none';
  correlationDirection: 'positive' | 'negative' | 'none';
  interpretation: string;
  actionable: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface HealthProfileSummary {
  score: number;
  bloodType: string | null;
  chronicConditions: string[];
  flaggedLabs: string[];
  activeMedications: string[];
  recentVitals: Record<string, number>;
}

// ========================================
// Apple Health Import
// ========================================

// ========================================
// Fitness Tracker
// ========================================

export type WorkoutSplitType =
  | 'push' | 'pull' | 'legs' | 'upper' | 'lower'
  | 'full_body' | 'cardio' | 'chest' | 'back'
  | 'shoulders' | 'arms' | 'core' | 'custom';

export type MuscleGroup =
  | 'chest' | 'back' | 'legs' | 'shoulders'
  | 'arms' | 'core' | 'cardio' | 'full_body';

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isWarmup: boolean;
}

export interface WorkoutExercise {
  id: string;
  sessionId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  exerciseType: 'strength' | 'cardio';
  sets: ExerciseSet[];
  distanceKm: number | null;
  durationMinutes: number | null;
  orderIndex: number;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutDate: string;
  splitType: WorkoutSplitType;
  durationMinutes: number;
  energyLevel: number;
  notes: string | null;
  exercises: WorkoutExercise[];
  createdAt: Date;
}

export interface BodyWeightLog {
  id: string;
  userId: string;
  logDate: string;
  weightKg: number;
  notes: string | null;
  createdAt: Date;
}

export interface ExerciseDefinition {
  name: string;
  muscleGroup: MuscleGroup;
  type: 'strength' | 'cardio';
  isCustom: boolean;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: string;
}

export interface FitnessStats {
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  totalVolumeWeek: number;
  latestBodyWeight: number | null;
  bodyWeightChange7d: number | null;
}

// ========================================
// Apple Health Import
// ========================================

export interface HealthImportSession {
  id: string;
  userId: string;
  importDate: Date;
  source: string;
  fileName: string | null;
  recordsParsed: number;
  recordsInserted: number;
  recordsSkipped: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  status: 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
}
