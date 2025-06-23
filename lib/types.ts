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
    synced: boolean;
    lastModified?: Date;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSync: Date | null;
    hasPendingChanges: boolean;
    conflictResolution: 'server-wins' | 'client-wins' | 'latest-wins';
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

// --- TIPO AÑADIDO ---
// Se añade y exporta la interfaz para los datos de sueño.
export interface SleepData {
  hours: number;
  quality: 'excelente' | 'buena' | 'regular' | 'mala' | 'cansada';
  date: Date;
}
