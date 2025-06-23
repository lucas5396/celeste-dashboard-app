// lib/types.ts

/**
 * Interfaz que representa la estructura de los datos de salud de un solo día.
 * Se utiliza para tipar los datos leídos y escritos en Firestore.
 */
export interface HealthData {
  id: string; // El ID del documento de Firestore
  date: string; // Fecha en formato ISO (YYYY-MM-DD)
  weight: number;
  fatPercentage: number;
  muscleMass: number;
  hydration: number;
  sleepHours: number;
  // --- CAMPOS NUEVOS ---
  // Añadimos campos cualitativos para un seguimiento más holístico.
  // Son opcionales para mantener la compatibilidad con los datos antiguos.
  sleepQuality?: 'Reparador' | 'Normal' | 'Interrumpido' | 'Poco profundo';
  energyLevel?: number; // Un valor de 1 (Bajo) a 5 (Óptimo)
  soreness?: number; // Dolor muscular de 1 (Leve) a 5 (Intenso)
  mood?: 'Feliz' | 'Normal' | 'Estresada' | 'Cansada'; // Estado de ánimo general
}

/**
 * Interfaz que define las props para los componentes de gráficos.
 */
export interface ChartProps {
  data: HealthData[]; // Un array de registros de datos de salud
}

/**
 * Define la estructura para los datos del perfil de Celeste.
 */
export interface CelesteProfileData {
  age: number;
  height: number;
  initialWeight: number;
  goalWeight: number;
  activityLevel: string; // Ej. "Bailarina Profesional"
}
