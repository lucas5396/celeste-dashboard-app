
export interface HealthMetric {
  id: string;
  date: Date;
  weight: number;
  fatMass: number;
  leanMass: number;
  musclePercentage: number;
  bonePercentage: number;
  waterPercentage: number;
  sleepHours: number;
  trainingHours: number;
  imc: number;
  notes?: string;
  synced?: boolean;
  lastModified?: Date;
}

export interface CelesteProfile {
  name: string;
  age: number;
  height: number;
  profession: string;
  experience: number;
  targetWeight: number;
  currentWeight: number;
  objectives: string[];
  considerations: string[];
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  hasPendingChanges: boolean;
  conflictResolution: 'server-wins' | 'client-wins' | 'latest-wins';
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

export interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  icon: string;
  color?: string;
  progress?: number;
}

export interface NotificationSettings {
  enablePush: boolean;
  trainingReminders: boolean;
  weeklyReports: boolean;
  goalAlerts: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  notifications: NotificationSettings;
  syncPreferences: {
    autoSync: boolean;
    conflictResolution: 'server-wins' | 'client-wins' | 'latest-wins';
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  includeNotes: boolean;
}
