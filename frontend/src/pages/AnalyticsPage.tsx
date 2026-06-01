import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { BarChart2, TrendingUp, Calendar, Activity } from 'lucide-react'
import api from '@/lib/api'

const PERIODS = ['week', 'month', 'year'] as const
type Period = typeof PERIODS[number]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => api.get(`/analytics?period=${period}`).then(r => r.data.data),
  })

  const tooltipStyle = { background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                period === p ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array(4).fill(0).map((_,i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weight Progress */}
          {data?.weight?.data?.length > 1 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" /> Weight Progress
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weight.data}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={['auto','auto']} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} kg`, 'Weight']} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Habit Completion */}
          {data?.habits?.data?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-amber-400" /> Habit Completion Rate
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.habits.data}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={[0,100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, 'Completion']} />
                    <Bar dataKey="rate" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Nutrition Calories */}
          {data?.nutrition?.data?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Daily Calories
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.nutrition.data}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${Math.round(v)} kcal`, 'Calories']} />
                    <Bar dataKey="calories" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sleep */}
          {data?.sleep?.data?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>😴</span> Sleep Hours
                <span className="badge badge-cyan ml-2">Avg: {data.sleep.avgHours}h</span>
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sleep.data}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={[0,12]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}h`, 'Sleep']} />
                    <Bar dataKey="hours" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Workout Summary */}
          {data?.workouts && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Sessions', value: data.workouts.totalSessions, icon: '🏋️', color: 'text-violet-400' },
                { label: 'Total Hours', value: `${Math.round(data.workouts.totalMinutes/60)}h`, icon: '⏱️', color: 'text-amber-400' },
                { label: 'Avg Duration', value: data.workouts.totalSessions ? `${Math.round(data.workouts.totalMinutes/data.workouts.totalSessions)}min` : '--', icon: '📊', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className="text-2xl">{s.icon}</span>
                  <p className={`text-2xl font-extrabold mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
