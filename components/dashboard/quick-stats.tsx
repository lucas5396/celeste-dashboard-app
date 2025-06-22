
'use client';

import { motion } from 'framer-motion';
import { HealthMetric } from '@/lib/types';
import { celesteProfile } from '@/lib/utils';
import ProgressRing from '@/components/ui/progress-ring';

interface QuickStatsProps {
  latestMetric?: HealthMetric;
}

export default function QuickStats({ latestMetric }: QuickStatsProps) {
  const currentWeight = latestMetric?.weight || celesteProfile.currentWeight;
  const currentIMC = latestMetric?.imc || 29.3;
  const currentSleep = latestMetric?.sleepHours || 6.0;
  const currentTraining = latestMetric?.trainingHours || 3.0;

  const weightProgress = ((celesteProfile.currentWeight - currentWeight) / (celesteProfile.currentWeight - celesteProfile.targetWeight)) * 100;
  const imcProgress = ((29.3 - currentIMC) / (29.3 - 24.5)) * 100;
  const sleepProgress = (currentSleep / 8) * 100;
  const trainingProgress = (currentTraining / 6) * 100;

  const stats = [
    {
      id: 'weight',
      title: 'Peso Actual (kg)',
      value: currentWeight.toFixed(1),
      target: `Meta: ${celesteProfile.targetWeight} kg`,
      progress: Math.max(0, Math.min(100, weightProgress)),
      color: 'var(--warning-color)',
      icon: '⚖️'
    },
    {
      id: 'imc',
      title: 'IMC',
      value: currentIMC.toFixed(1),
      target: 'Meta: 24.5',
      progress: Math.max(0, Math.min(100, imcProgress)),
      color: 'var(--warning-color)',
      icon: '📊'
    },
    {
      id: 'sleep',
      title: 'Horas Sueño',
      value: currentSleep.toFixed(1),
      target: currentSleep < 7 ? 'Mejorar calidad' : 'Buena calidad',
      progress: Math.max(0, Math.min(100, sleepProgress)),
      color: currentSleep < 7 ? 'var(--error-color)' : 'var(--success-color)',
      icon: '😴'
    },
    {
      id: 'training',
      title: 'H. Entrenamiento/sem',
      value: currentTraining.toFixed(1),
      target: '1 ensayo semanal',
      progress: Math.max(0, Math.min(100, trainingProgress)),
      color: 'var(--success-color)',
      icon: '💪'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          className="card p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xl mb-2">{stat.icon}</div>
          <motion.div 
            className="text-2xl font-bold gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
          >
            {stat.value}
          </motion.div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {stat.title}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            {stat.target}
          </div>
          <div className="flex justify-center">
            <ProgressRing
              value={stat.progress}
              max={100}
              size={48}
              strokeWidth={3}
              color={stat.color}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
