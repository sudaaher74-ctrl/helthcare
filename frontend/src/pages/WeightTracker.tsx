import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Scale, TrendingUp, Trash2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useAuthStore } from '@/stores/authStore'

export default function WeightTracker() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['weight'],
    queryFn: () => api.get('/weight?limit=60').then(r => r.data.data),
  })

  const deleteLog = useMutation({
    mutationFn: (id: string) => api.delete(`/weight/${id}`),
    onSuccess: () => { toast.success('Entry deleted'); qc.invalidateQueries({ queryKey: ['weight'] }) },
  })

  const logs = data?.logs || []
  const forecast = data?.forecast

  const chartData = [...logs].reverse().map((l: any) => ({
    date: format(new Date(l.date), 'MMM d'),
    weight: l.weight,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return
    setSaving(true)
    try {
      await api.post('/weight', { weight: parseFloat(weight), date, notes })
      toast.success('Weight logged! 📈')
      setWeight('')
      setNotes('')
      qc.invalidateQueries({ queryKey: ['weight', 'dashboard'] })
      setShowForm(false)
    } catch { toast.error('Failed to log weight') } finally { setSaving(false) }
  }

  const current = logs[0]?.weight
  const target = user?.targetWeight || 55
  const remaining = target - (current || 0)
  const bmi = user?.height && current
    ? (current / ((user.height / 100) ** 2)).toFixed(1) : '--'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Weight Tracker</h1>
          <p className="text-slate-400 text-sm">Track your weight gain journey</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> Log Weight
        </button>
      </div>

      {/* Quick Log Form */}
      {showForm && (
        <motion.form initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} onSubmit={handleSubmit} className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3">Log Today's Weight</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 46.5" className="input-field text-lg font-bold" autoFocus />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={saving || !weight} className="btn btn-primary">
              {saving ? '...' : 'Save'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card">
          <Scale size={20} className="text-violet-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{current || '--'}</p>
          <p className="text-xs text-slate-500">Current (kg)</p>
        </div>
        <div className="stat-card">
          <Target size={20} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{target}</p>
          <p className="text-xs text-slate-500">Target (kg)</p>
        </div>
        <div className="stat-card">
          <TrendingUp size={20} className="text-amber-400 mb-2" />
          <p className={`text-2xl font-extrabold ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {remaining > 0 ? `+${remaining.toFixed(1)}` : '✓'}
          </p>
          <p className="text-xs text-slate-500">kg to goal</p>
        </div>
        <div className="stat-card">
          <span className="text-xl mb-2 block">📊</span>
          <p className="text-2xl font-extrabold text-white">{bmi}</p>
          <p className="text-xs text-slate-500">BMI</p>
        </div>
      </div>

      {/* Forecast Banner */}
      {forecast && (
        <div className="glass-card p-4 border-l-2 border-emerald-500">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-semibold text-white">Goal Forecast</p>
              <p className="text-xs text-slate-400">
                At your current rate of <span className="text-emerald-400 font-bold">+{forecast.weeklyGain}kg/week</span>,
                you'll reach {target}kg in approximately{' '}
                <span className="text-emerald-400 font-bold">{forecast.weeksRemaining} weeks</span>
                {' '}({format(new Date(forecast.estimatedDate), 'MMMM yyyy')})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={18} />
              Weight Progress
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                />
                <ReferenceLine y={target} stroke="#7c3aed" strokeDasharray="4 4" strokeOpacity={0.8} label={{ position: 'top', value: 'Goal', fill: '#a78bfa', fontSize: 11 }} />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)"
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-bold text-white mb-3">Weight History</h2>
        {isLoading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_,i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : logs.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Scale size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400">No weight logged yet. Start tracking today!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any, i: number) => {
              const prev = logs[i + 1]
              const diff = prev ? (log.weight - prev.weight) : null
              return (
                <div key={log.id} className="flex items-center justify-between p-3 glass-card glass-card-hover">
                  <div>
                    <p className="text-sm font-medium text-white">{log.weight} kg</p>
                    <p className="text-xs text-slate-500">{format(new Date(log.date), 'EEEE, MMM d')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {diff !== null && (
                      <span className={`text-sm font-semibold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                      </span>
                    )}
                    <button onClick={() => deleteLog.mutate(log.id)} className="btn btn-ghost btn-icon text-slate-600 hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
