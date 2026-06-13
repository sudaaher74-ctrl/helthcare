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

  const tooltipStyle = { background: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-base)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-base)] to-[var(--color-text-muted)]">
            Insights
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Track your progress and discover trends</p>
        </div>
        <div className="flex gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-subtle)] w-fit">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all capitalize ${
                period === p ? 'bg-[var(--color-text-base)] text-[var(--color-bg-primary)] text-[var(--color-text-base)] shadow-lg shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]'
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
            <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-surface)] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
              <h2 className="font-bold text-[var(--color-text-base)] mb-6 flex items-center gap-2 relative z-10">
                <TrendingUp size={18} className="text-[var(--color-text-muted)]" /> Weight Progress
              </h2>
              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weight.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={10}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={['auto','auto']} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} formatter={(v: any) => [`${v} kg`, 'Weight']} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Habit Completion */}
          {data?.habits?.data?.length > 0 && (
            <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-surface)] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
              <h2 className="font-bold text-[var(--color-text-base)] mb-6 flex items-center gap-2 relative z-10">
                <Activity size={18} className="text-[var(--color-text-muted)]" /> Habit Completion Rate
              </h2>
              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.habits.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={10}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={[0,100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }} formatter={(v: any) => [`${v}%`, 'Completion']} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="rate" fill="#f59e0b" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Nutrition Calories */}
          {data?.nutrition?.data?.length > 0 && (
            <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-surface)] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
              <h2 className="font-bold text-[var(--color-text-base)] mb-6 flex items-center gap-2 relative z-10">
                <span>🔥</span> Daily Calories
              </h2>
              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.nutrition.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={10}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f97316', fontWeight: 'bold' }} formatter={(v: any) => [`${Math.round(v)} kcal`, 'Calories']} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="calories" fill="#f97316" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sleep */}
          {data?.sleep?.data?.length > 0 && (
            <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-surface)] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
              <h2 className="font-bold text-[var(--color-text-base)] mb-6 flex items-center gap-2 relative z-10">
                <span>😴</span> Sleep Hours
                <span className="badge badge-cyan ml-2 border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">Avg: {data.sleep.avgHours}h</span>
              </h2>
              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sleep.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={10}
                      tickFormatter={d => new Date(d).toLocaleDateString('en', {month:'short',day:'numeric'})} />
                    <YAxis domain={[0,12]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} tickFormatter={v => `${v}h`} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#6366f1', fontWeight: 'bold' }} formatter={(v: any) => [`${v}h`, 'Sleep']} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="hours" fill="#6366f1" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Workout Summary */}
          {data?.workouts && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Sessions', value: data.workouts.totalSessions, icon: '🏋️', color: 'text-[var(--color-text-muted)]', shadow: 'shadow-md' },
                { label: 'Total Hours', value: `${Math.round(data.workouts.totalMinutes/60)}h`, icon: '⏱️', color: 'text-[var(--color-text-muted)]', shadow: 'shadow-md' },
                { label: 'Avg Duration', value: data.workouts.totalSessions ? `${Math.round(data.workouts.totalMinutes/data.workouts.totalSessions)}min` : '--', icon: '📊', color: 'text-[var(--color-text-muted)]', shadow: 'shadow-md' },
              ].map(s => (
                <div key={s.label} className={`glass-card p-6 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:bg-[var(--color-surface)]`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border-subtle)] mb-4 shadow-lg ${s.shadow}`}>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
