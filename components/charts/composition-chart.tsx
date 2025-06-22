
'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HealthMetric } from '@/lib/types';
import { getChartColors } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface CompositionChartProps {
  latestMetric?: HealthMetric;
}

export default function CompositionChart({ latestMetric }: CompositionChartProps) {
  const { theme } = useTheme();
  const colors = getChartColors(theme === 'dark');

  const data = useMemo(() => {
    if (!latestMetric) return [];

    const fatPercentage = (latestMetric.fatMass / latestMetric.weight) * 100;
    const leanPercentage = (latestMetric.leanMass / latestMetric.weight) * 100;
    const bonePercentage = latestMetric.bonePercentage || 3.6;
    const otherPercentage = 100 - fatPercentage - leanPercentage - bonePercentage;

    return [
      { name: 'Masa Grasa', value: fatPercentage, color: '#FF6363' },
      { name: 'Masa Magra', value: leanPercentage, color: '#80D8C3' },
      { name: 'Hueso', value: bonePercentage, color: '#A19AD3' },
      { name: 'Otros', value: Math.max(0, otherPercentage), color: '#FF9149' }
    ];
  }, [latestMetric]);

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(1)}%`, name];
  };

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4 gradient-text">
        Composición Corporal Actual
      </h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ value }) => `${value.toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '11px'
              }}
              formatter={formatTooltip}
            />
            <Legend 
              verticalAlign="top"
              align="right"
              layout="vertical"
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
