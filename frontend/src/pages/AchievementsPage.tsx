import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trophy, Star, Award, Shield, Sparkles, CheckCircle2, Lock } from 'lucide-react'
import api from '@/lib/api'
import { PremiumCard } from '@/components/ui/PremiumCard'

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  UNCOMMON: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  RARE: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
}

export default function AchievementsPage() {
  const [filter, setFilter] = useState<string>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/achievements').then((r) => r.data.data),
  })

  const { achievements = [], totalUnlocked = 0, totalPossible = 0 } = data || {}

  const categories = ['ALL', ...Array.from(new Set(achievements.map((a: any) => a.category).filter(Boolean)))]

  const filteredAchievements = achievements.filter((a: any) => {
    if (filter === 'ALL') return true
    if (filter === 'UNLOCKED') return a.isUnlocked
    if (filter === 'LOCKED') return !a.isUnlocked
    return a.category === filter
  })

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Trophy size={14} /> Milestones & Trophies
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--color-text-base-value)]">
              Achievements
            </h1>
            <p className="text-sm text-[var(--color-text-muted-value)] max-w-md">
              Unlock badges, level up your character, and celebrate consistency across habits, fitness, and nutrition.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--color-bg-primary-value)]/60 backdrop-blur-md p-4 rounded-2xl border border-[var(--color-border-subtle-value)]">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
              🏆
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-wider">Unlocked</p>
              <p className="text-2xl font-mono font-bold text-[var(--color-text-base-value)]">
                {totalUnlocked} <span className="text-sm text-[var(--color-text-muted-value)] font-sans">/ {totalPossible}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Filter Pills ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat: any) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === cat
                ? 'bg-[var(--color-text-base-value)] text-[var(--color-bg-primary-value)] shadow-md'
                : 'bg-[var(--color-bg-secondary-value)] text-[var(--color-text-muted-value)] hover:text-[var(--color-text-base-value)] border border-[var(--color-border-subtle-value)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Achievement Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="glass-card p-12 text-center text-[var(--color-text-muted-value)]">
          <Trophy size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-[var(--color-text-base-value)]">No achievements found</p>
          <p className="text-xs mt-1">Try selecting another filter or complete actions to unlock new badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAchievements.map((item: any) => {
            const rarity = RARITY_COLORS[item.rarity] || RARITY_COLORS.COMMON
            return (
              <PremiumCard
                key={item.id}
                hoverAction
                className={`flex flex-col relative overflow-hidden transition-all duration-300 ${
                  item.isUnlocked
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent'
                    : 'opacity-60 grayscale hover:opacity-80'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-secondary-value)] border border-[var(--color-border-subtle-value)] flex items-center justify-center text-3xl shadow-inner">
                    {item.icon || '⭐'}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarity.bg} ${rarity.border} ${rarity.text}`}>
                      {item.rarity}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-amber-400">
                      +{item.xpReward} XP
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--color-text-base-value)] flex items-center gap-1.5">
                    {item.name}
                    {item.isUnlocked && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted-value)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle-value)]/40 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-text-muted-value)] font-medium uppercase tracking-wider text-[10px]">
                    {item.category}
                  </span>
                  {item.isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles size={12} /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[var(--color-text-muted-value)] font-semibold flex items-center gap-1">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>
              </PremiumCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
