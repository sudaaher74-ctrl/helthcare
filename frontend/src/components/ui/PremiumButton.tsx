import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './PremiumCard'; // Reusing cn utility

export type ButtonVariant = 'primary' | 'ai' | 'water' | 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'pre_workout' | 'post_workout' | 'cancel' | 'delete' | 'secondary';

interface PremiumButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700',
  ai: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md shadow-purple-500/20 hover:opacity-90',
  water: 'bg-sky-500 text-white shadow-md shadow-sky-500/20 hover:bg-sky-600',
  breakfast: 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20 hover:bg-yellow-500',
  lunch: 'bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600',
  dinner: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700',
  snacks: 'bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:bg-pink-600',
  pre_workout: 'bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600',
  post_workout: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600',
  cancel: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  delete: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900',
  secondary: 'bg-[var(--color-bg-secondary-value)] text-[var(--color-text-base-value)] hover:bg-[var(--color-bg-tertiary-value)]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3 text-base font-bold rounded-2xl',
};

export function PremiumButton({ variant = 'primary', size = 'md', className, children, ...props }: PremiumButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
