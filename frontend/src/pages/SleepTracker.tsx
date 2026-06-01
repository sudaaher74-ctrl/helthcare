import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Moon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SleepTracker() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    bedTime: '22:30', wakeTime: '06:30', quality: 4, notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['sleep'],
    queryFn: () => api.get('/sleep?limit=30').then(r => r.data.data),
  })

  const deleteLog = useMutation({
    mutationFn: (id: string) => api.delete(`/sleep/${id}`),
    onSuccess: () => { toast.success('Sleep log deleted'); qc.invalidateQueries({ queryKey: ['sleep'] }) },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const bedDate = new Date(`${form.date}T${form.bedTime}`)
      let wakeDate = new Date(`${form.date}T${form.wakeTime}`)
      if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1)
      await api.post('/sleep', { bedTime: bedDate.toISOString(), wakeTime: wakeDate.toISOString(), quality: form.quality, notes: form.notes })
      toast.success('Sleep logged! 😴')
      setShowForm(false)
      qc.invalidateQueries({ queryKey: ['sleep', 'dashboard'] })
    } catch { toast.error('Failed to log sleep') } finally { setSaving(false) }
  }

  const logs = data?.logs || []
  const avgHours = data?.avgDuration ? (data.avgDuration / 60).toFixed(1) : '--'
  const avgQuality = data?.avgQuality || '--'

  const chartData = [...logs].reverse().slice(-14).map((l: any) => ({
    date: format(new Date(l.date), 'MMM d'),
    hours: parseFloat((l.durationMinutes / 60).toFixed(1)),
    quality: l.quality,
  }))

  const QUALITIES = ['😴', '😞', '😐', '😊', '💎']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sleep Tracker</h1>
          <p className="text-slate-400 text-sm">Monitor your rest and recovery</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <Moon size={20} className="text-indigo-400 mb-2" />
          <p className="text-2xl font-extrabold text-white">{avgHours}h</p>
          <p className="text-xs text-slate-500">Avg Sleep</p>
        </div>
        <div className="stat-card">
          <span className="text-2xl mb-2 block">⭐</span>
          <p className="text-2xl font-extrabold text-white">{avgQuality}<span className="text-sm text-slate-500">/5</span></p>
          <p className="text-xs text-slate-500">Avg Quality</p>
        </div>
        <div className="stat-card">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-2xl font-extrabold text-white">{logs.length}</p>
          <p className="text-xs text-slate-500">Days Logged</p>
        </div>
      </div>

      {/* Quick Log Form */}
      {showForm && (
        <motion.form initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-white">Log Sleep</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Bed Time</label>
              <input type="time" value={form.bedTime} onChange={e => setForm(p=>({...p, bedTime: e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Wake Time</label>
              <input type="time" value={form.wakeTime} onChange={e => setForm(p=>({...p, wakeTime: e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p=>({...p, date: e.target.value}))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Sleep Quality</label>
            <div className="flex gap-3">
              {QUALITIES.map((q, i) => (
                <button key={i} type="button" onClick={() => setForm(p=>({...p, quality: i+1}))}
                  className={`flex-1 py-2 rounded-xl border text-lg transition-all ${form.quality === i+1 ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : 'Log Sleep 😴'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-5">
          <h2 className="font-bold text-white mb-4">Sleep Hours (Last 14 days)</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,12]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                  formatter={(v: any) => [`${v}h`, 'Sleep']} />
                <Bar dataKey="hours" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-bold text-white mb-3">Sleep History</h2>
        {isLoading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : logs.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Moon size={32} className="mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400">No sleep logged yet. Track your rest for better recovery!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3.5 glass-card glass-card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Moon size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {(log.durationMinutes / 60).toFixed(1)}h · Quality: {'⭐'.repeat(log.quality)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(log.bedTime), 'h:mm a')} → {format(new Date(log.wakeTime), 'h:mm a')} · {format(new Date(log.date), 'MMM d')}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteLog.mutate(log.id)} className="btn btn-ghost btn-icon text-slate-600 hover:text-rose-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
