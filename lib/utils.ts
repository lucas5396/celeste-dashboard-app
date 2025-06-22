import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { HealthMetric, CelesteProfile } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Celeste's specific profile data
export const celesteProfile: CelesteProfile = {
  name: "Celeste",
  age: 32,
  height: 170,
  profession: "Bailarina de Ballet Folklórico Argentino",
  experience: 10,
  targetWeight: 71,
  currentWeight: 84.6,
  objectives: [
    "Alcanzar 71 kg manteniendo masa muscular",
    "Mejorar resistencia, fuerza y flexibilidad",
    "Optimizar calidad del sueño"
  ],
  considerations: [
    "Intolerancia al gluten",
    "Fatiga al despertar",
    "Entrenamiento específico para ballet folklórico"
  ]
};

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
}

// Calculate progress percentage
export function calculateProgress(current: number, target: number, initial: number): number {
  if (initial === target) return 100;
  return Math.max(0, Math.min(100, ((initial - current) / (initial - target)) * 100));
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Format date for input
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Generate sample data for Celeste
export function generateSampleData(): HealthMetric[] {
  const sampleData: HealthMetric[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    // MODIFICACIÓN/OPTIMIZACIÓN: Evitar el uso de setWeek/getWeek personalizados
    // para la generación de datos de muestra, ya que causaban "Invalid time value".
    // En su lugar, sumamos directamente días para simular incrementos semanales.
    // date.setWeek(date.getWeek() + i); // Línea original comentada
    date.setDate(startDate.getDate() + (i * 7)); // Nueva línea para un incremento semanal simple
    
    sampleData.push({
      id: `sample_${i}`,
      date,
      weight: 84.6 - (i * 0.3),
      fatMass: 31.91 - (i * 0.15),
      leanMass: 49.78 + (i * 0.05),
      musclePercentage: 55.2 + (i * 0.1),
      bonePercentage: 3.6,
      waterPercentage: 42.7 + (i * 0.2),
      sleepHours: 6.0 + (i * 0.1),
      trainingHours: 3.0 + (i * 0.2),
      imc: calculateBMI(84.6 - (i * 0.3), 170),
      notes: i % 3 === 0 ? 'Día de ensayo intenso' : undefined,
      synced: true,
      lastModified: date
    });
  }

  return sampleData;
}

// Validate health metric data
export function validateHealthMetric(data: Partial<HealthMetric>): string[] {
  const errors: string[] = [];

  if (!data.weight || data.weight < 30 || data.weight > 200) {
    errors.push('El peso debe estar entre 30 y 200 kg');
  }

  if (!data.fatMass || data.fatMass < 0 || data.fatMass > 100) {
    errors.push('La masa grasa debe estar entre 0 y 100 kg');
  }

  if (!data.leanMass || data.leanMass < 0 || data.leanMass > 100) {
    errors.push('La masa magra debe estar entre 0 y 100 kg');
  }

  if (!data.sleepHours || data.sleepHours < 0 || data.sleepHours > 24) {
    errors.push('Las horas de sueño deben estar entre 0 y 24');
  }

  if (!data.trainingHours || data.trainingHours < 0 || data.trainingHours > 50) {
    errors.push('Las horas de entrenamiento deben estar entre 0 y 50 por semana');
  }

  return errors;
}

// Export data to CSV
export function exportToCSV(data: HealthMetric[]): string {
  const headers = [
    'Fecha',
    'Peso (kg)',
    'Masa Grasa (kg)',
    'Masa Magra (kg)',
    'Músculo (%)',
    'Hueso (%)',
    'Agua (%)',
    'Sueño (h)',
    'Entrenamiento (h)',
    'IMC',
    'Notas'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      formatDate(row.date),
      row.weight,
      row.fatMass,
      row.leanMass,
      row.musclePercentage,
      row.bonePercentage,
      row.waterPercentage,
      row.sleepHours,
      row.trainingHours,
      row.imc,
      row.notes || ''
    ].join(','))
  ].join('\n');

  return csvContent;
}

// Get chart colors based on theme
export function getChartColors(isDark = false) {
  return {
    primary: isDark ? '#d4af37' : '#8b5a3c',
    secondary: isDark ? '#f0d75c' : '#d4af37',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',
    grid: isDark ? '#3d342a' : '#e8ddd4',
    text: isDark ? '#f5f1e8' : '#2d1810'
  };
}

// Calculate streak (consecutive days of data entry)
export function calculateStreak(data: HealthMetric[]): number {
  if (data.length === 0) return 0;

  const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 1;
  let currentDate = new Date(sortedData[0].date);

  for (let i = 1; i < sortedData.length; i++) {
    const prevDate = new Date(sortedData[i].date);
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// Get recommendations based on current metrics
export function getRecommendations(latestMetric: HealthMetric): string[] {
  const recommendations: string[] = [];

  // Weight recommendations
  if (latestMetric.weight > celesteProfile.targetWeight) {
    const deficit = latestMetric.weight - celesteProfile.targetWeight;
    recommendations.push(`Objetivo: reducir ${deficit.toFixed(1)} kg más para alcanzar peso meta`);
  }

  // Sleep recommendations
  if (latestMetric.sleepHours < 7) {
    recommendations.push('Mejorar calidad del sueño: apuntar a 7-9 horas por noche');
  }

  // Training recommendations
  if (latestMetric.trainingHours < 5) {
    recommendations.push('Incrementar gradualmente las horas de entrenamiento para mejorar resistencia');
  }

  // Hydration recommendations
  if (latestMetric.waterPercentage < 45) {
    recommendations.push('Aumentar ingesta de agua para mejorar hidratación corporal');
  }

  // Muscle mass recommendations
  if (latestMetric.musclePercentage < 60) {
    recommendations.push('Incorporar ejercicios de fuerza para aumentar masa muscular');
  }

  return recommendations;
}

// Service Worker utilities
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// PWA install prompt
export function setupPWAInstall() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installButton = document.getElementById('pwa-install');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });
}

// Las extensiones de Date.prototype se mantienen igual, pero la forma en que se
// generan los datos de muestra ya no las usa directamente para evitar errores.
declare global {
  interface Date {
    getWeek(): number;
    setWeek(week: number): void;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

Date.prototype.setWeek = function(week: number) {
  const date = new Date(this.getFullYear(), 0, 4);
  this.setTime(date.getTime() + ((week - 1) * 7 - 3 + (date.getDay() + 6) % 7) * 86400000);
};