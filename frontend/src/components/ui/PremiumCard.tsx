import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PremiumCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hoverAction?: boolean;
}

export function PremiumCard({ children, className, glass = false, hoverAction = false, ...props }: PremiumCardProps) {
  return (
    <motion.div
      whileHover={hoverAction ? { scale: 1.01, translateY: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        glass ? 'premium-glass rounded-3xl' : 'premium-card',
        'p-6 sm:p-8',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
