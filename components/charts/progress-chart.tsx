
'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthMetric } from '@/lib/types';
import { formatDate, getChartColors } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface ProgressChartProps {
  data: HealthMetric[];
  title: string;
  dataKey: keyof HealthMetric;
  color?: string;
  unit?: string;
  target?: number;
}

export default function ProgressChart({ 
  data, 
  title, 
  dataKey, 
  color, 
  unit = '', 
  target 
}: ProgressChartProps) {
  const { theme } = useTheme();
  const colors = getChartColors(theme === 'dark');

  const chartData = useMemo(() => {
    return data
      .slice(-12) // Last 12 entries
      .map(item => ({
        date: formatDate(item.date),
        value: Number(item[dataKey]),
        target: target
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, dataKey, target]);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'value') {
      return [`${value}${unit}`, title];
    }
    if (name === 'target') {
      return [`${value}${unit}`, 'Meta'];
    }
    return [value, name];
  };

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4 gradient-text">{title}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid}
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke={colors.text}
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke={colors.text}
              fontSize={10}
              tickLine={false}
            />
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
              wrapperStyle={{ fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color || colors.primary}
              strokeWidth={3}
              dot={{ fill: color || colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name={title}
            />
            {target && (
              <Line
                type="monotone"
                dataKey="target"
                stroke={colors.secondary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Meta"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
