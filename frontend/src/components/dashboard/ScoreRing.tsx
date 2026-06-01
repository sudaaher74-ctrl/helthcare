import React from 'react'
import { motion } from 'framer-motion'

interface ScoreRingProps {
  label: string
  value: number
  color: string
  gradient: string
  icon: string
}

export default function ScoreRing({ label, value, color, gradient, icon }: ScoreRingProps) {
  const r = 36
  const circumference = 2 * Math.PI * r
  const progress = Math.max(0, Math.min(100, value))
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="glass-card p-3 flex flex-col items-center gap-2 glass-card-hover">
      <div className="relative">
        <svg width="88" height="88" className="score-ring">
          {/* Background circle */}
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="5" />
          {/* Progress arc */}
          <motion.circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base leading-none">{icon}</span>
          <motion.span
            className="text-lg font-extrabold text-white leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-slate-400 text-center">{label}</p>
    </div>
  )
}
