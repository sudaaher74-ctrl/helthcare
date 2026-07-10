import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressProps {
  progress: number; // 0 to 100
  color?: string; // CSS color or Tailwind class
  height?: number;
  className?: string;
}

export function AnimatedProgress({ progress, color = 'bg-blue-500', height = 8, className = '' }: AnimatedProgressProps) {
  // Ensure progress is bounded
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Check if color is a hex/rgb or a tailwind class
  const isTailwindClass = !color.startsWith('#') && !color.startsWith('rgb') && !color.startsWith('var');

  return (
    <div 
      className={`w-full bg-[var(--color-bg-tertiary-value)] rounded-full overflow-hidden ${className}`} 
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full rounded-full relative ${isTailwindClass ? color : ''}`}
        style={!isTailwindClass ? { background: color } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>
    </div>
  );
}
