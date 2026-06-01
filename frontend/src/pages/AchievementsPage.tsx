import React from 'react'
import { Trophy, Star, Award, Shield } from 'lucide-react'

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Achievements</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { title: 'First Steps', desc: 'Log your first workout', icon: <Star />, color: 'text-amber-400', unlocked: true },
          { title: 'Habit Hero', desc: 'Complete all habits for 7 days', icon: <Trophy />, color: 'text-violet-400', unlocked: false },
          { title: 'Consistency is Key', desc: 'Log weight 30 days in a row', icon: <Award />, color: 'text-emerald-400', unlocked: false },
          { title: 'Iron Will', desc: 'Workout 5 times in a week', icon: <Shield />, color: 'text-rose-400', unlocked: false },
        ].map((a, i) => (
          <div key={i} className={`glass-card p-5 text-center ${!a.unlocked ? 'opacity-50 grayscale' : ''}`}>
            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl mb-3 ${a.color} bg-white/5`}>
              {React.cloneElement(a.icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <h3 className="font-bold text-white">{a.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{a.desc}</p>
            {a.unlocked && <span className="badge badge-amber mt-3 inline-block">Unlocked</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
