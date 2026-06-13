import React from 'react'
import { Trophy, Star, Award, Shield } from 'lucide-react'

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
          Achievements
        </h1>
        <p className="text-slate-400 text-sm mt-2">Unlock milestones and earn XP</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          { title: 'First Steps', desc: 'Log your first workout', icon: <Star />, bg: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/50', unlocked: true },
          { title: 'Habit Hero', desc: 'Complete all habits for 7 days', icon: <Trophy />, bg: 'from-violet-400 to-fuchsia-600', shadow: 'shadow-violet-500/50', unlocked: false },
          { title: 'Iron Will', desc: 'Workout 5 times in a week', icon: <Shield />, bg: 'from-rose-400 to-red-600', shadow: 'shadow-rose-500/50', unlocked: false },
          { title: 'Consistent', desc: 'Log weight 30 days', icon: <Award />, bg: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/50', unlocked: false },
        ].map((a, i) => (
          <div key={i} className={`glass-card p-5 flex flex-col items-center text-center transition-all duration-300 ${a.unlocked ? 'glass-card-hover scale-100 hover:scale-105' : 'opacity-40 grayscale scale-95'}`}>
            <div className={`relative w-20 h-20 flex items-center justify-center rounded-full mb-4 bg-gradient-to-br ${a.bg} ${a.unlocked ? `shadow-lg ${a.shadow}` : ''}`}>
              <div className="absolute inset-1 bg-black/20 rounded-full" />
              <div className="relative text-white drop-shadow-md">
                {React.cloneElement(a.icon as React.ReactElement<any>, { size: 36, strokeWidth: 1.5 })}
              </div>
            </div>
            <h3 className="font-bold text-white text-sm">{a.title}</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{a.desc}</p>
            {a.unlocked && <span className="mt-3 text-[10px] font-black tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Unlocked</span>}
            {!a.unlocked && <span className="mt-3 text-[10px] font-bold text-slate-500">Locked</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
