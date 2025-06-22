
'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ProgressRing({ 
  value, 
  max, 
  size = 48, 
  strokeWidth = 3, 
  color = 'var(--primary-color)' 
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const progress = Math.max(0, Math.min(100, (value / max) * 100));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          stroke="var(--border-color)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="progress-ring-circle"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      {/* Percentage text */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
        style={{ fontSize: `${size * 0.2}px` }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
}
