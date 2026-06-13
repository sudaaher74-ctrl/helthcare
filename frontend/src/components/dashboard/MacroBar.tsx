import React from 'react'
import { motion } from 'framer-motion'

interface MacroBarProps {
  label: string
  current: number
  goal: number
  unit: string
  color: string
  gradient: string
}

export default function MacroBar({ label, current, goal, unit, color, gradient }: MacroBarProps) {
  const pct = Math.min(100, goal > 0 ? (current / goal) * 100 : 0)
  const over = current > goal

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold" style={{ color: over ? '#f43f5e' : color }}>
          {typeof current === 'number' ? current.toFixed(current % 1 === 0 ? 0 : 1) : current}
          <span className="text-[var(--color-text-muted)] font-normal text-xs ml-1">/ {goal}{unit}</span>
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          className={`progress-bar-fill bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
