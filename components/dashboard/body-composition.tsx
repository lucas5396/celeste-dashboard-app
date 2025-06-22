
'use client';

import { motion } from 'framer-motion';
import { HealthMetric } from '@/lib/types';
import { Scale, Dumbbell, Heart, Droplets } from 'lucide-react';

interface BodyCompositionProps {
  latestMetric?: HealthMetric;
}

export default function BodyComposition({ latestMetric }: BodyCompositionProps) {
  const metrics = [
    {
      title: 'Grasa Subcutánea',
      value: latestMetric?.fatMass || 31.91,
      unit: 'kg',
      icon: Scale,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Masa Magra',
      value: latestMetric?.leanMass || 49.78,
      unit: 'kg',
      icon: Dumbbell,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Tasa Muscular',
      value: latestMetric?.musclePercentage || 55.2,
      unit: '%',
      icon: Heart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Hidratación',
      value: latestMetric?.waterPercentage || 42.7,
      unit: '%',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.title}
            className={`card metric-card p-4 ${metric.bgColor}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <motion.div 
                  className="text-lg font-bold gradient-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                >
                  {metric.value} {metric.unit}
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {metric.title}
                </div>
              </div>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, delay: index * 0.2 }}
              >
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
