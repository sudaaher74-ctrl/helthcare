import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from './PremiumCard';

interface MacroStatCardProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  trend?: string;
}

export function MacroStatCard({ label, current, goal, unit, color, icon, trend }: MacroStatCardProps) {
  const percentage = Math.min(100, goal > 0 ? (current / goal) * 100 : 0);
  
  return (
    <PremiumCard hoverAction className="flex flex-col relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div 
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl" 
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {icon}
          </div>
          <span className="font-semibold text-sm text-[var(--color-text-base-value)] font-heading">{label}</span>
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto relative z-10">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-[var(--color-text-base-value)]">
              {current}
            </span>
            <span className="text-sm font-medium text-[var(--color-text-muted-value)]">{unit}</span>
          </div>
          <div className="text-xs font-medium text-[var(--color-text-muted-value)] mt-1">
            Target: {goal}{unit}
          </div>
          {trend && (
            <div className="text-[10px] font-bold text-green-500 mt-2 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
              {trend}
            </div>
          )}
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(150,150,150,0.1)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke={color} strokeWidth="8" strokeLinecap="round"
              initial={{ strokeDasharray: "0 251.2" }}
              animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold font-mono" style={{ color }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
