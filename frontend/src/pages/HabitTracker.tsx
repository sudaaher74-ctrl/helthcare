import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Edit2, Trash2, Flame, Filter, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import api from '@/lib/api'

const CATEGORY_COLORS: Record<string, string> = {
  MORNING: '#f59e0b', PRODUCTIVITY: '#6366f1', HEALTH: '#10b981', NIGHT: '#8b5cf6', CUSTOM: '#06b6d4'
}

const CATEGORY_ICONS: Record<string, string> = {
  MORNING: '🌅', PRODUCTIVITY: '⚡', HEALTH: '💪', NIGHT: '🌙', CUSTOM: '⭐'
}

export default function HabitTracker() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState<any>(null)
  const [filter, setFilter] = useState('ALL')

  const { data: habitData, isLoading } = useQuery({
    queryKey: ['habits-today'],
    queryFn: () => api.get('/habits/today').then((r) => r.data.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['habit-stats'],
    queryFn: () => api.get('/habits/stats?period=week').then((r) => r.data.data),
  })

  const completeHabit = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.post(`/habits/${id}/complete`, { completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits-today'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const deleteHabit = useMutation({
    mutationFn: (id: string) => api.delete(`/habits/${id}`),
    onSuccess: () => {
      toast.success('Habit deleted')
      qc.invalidateQueries({ queryKey: ['habits-today'] })
    },
  })

  const habits = habitData || []
  const filtered = filter === 'ALL' ? habits : habits.filter((h: any) => h.category === filter)
  const completed = habits.filter((h: any) => h.completedToday).length
  const total = habits.length
  const rate = total ? Math.round((completed / total) * 100) : 0

  const grouped = filtered.reduce((acc: any, h: any) => {
    if (!acc[h.category]) acc[h.category] = []
    acc[h.category].push(h)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button onClick={() => { setEditHabit(null); setShowForm(true) }}
          className="btn btn-primary">
          <Plus size={16} />
          New Habit
        </button>
      </div>

      {/* Progress Overview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-extrabold text-white">{completed}<span className="text-slate-500 text-xl font-normal">/{total}</span></p>
            <p className="text-slate-400 text-sm">habits completed today</p>
          </div>
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - rate / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 8px #7c3aed88)' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-violet-400">{rate}%</span>
            </div>
          </div>
        </div>
        <div className="progress-bar h-2">
          <motion.div
            className="progress-bar-fill gradient-violet"
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold text-amber-400">{stats?.completionRate || 0}%</p>
            <p className="text-xs text-slate-500">7-Day Rate</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-400">{stats?.totalCompleted || 0}</p>
            <p className="text-xs text-slate-500">Total Completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-violet-400">{total}</p>
            <p className="text-xs text-slate-500">Active Habits</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'MORNING', 'PRODUCTIVITY', 'HEALTH', 'NIGHT'].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === cat
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                : 'border-white/10 text-slate-400 hover:border-white/20'
            }`}>
            {cat === 'ALL' ? '🎯 All' : `${CATEGORY_ICONS[cat]} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {/* Habit Groups */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catHabits]: any) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </h3>
                <div className="flex-1 border-t border-white/5 ml-2" />
              </div>
              <div className="space-y-2">
                {catHabits.map((habit: any) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={() => completeHabit.mutate({ id: habit.id, completed: !habit.completedToday })}
                    onEdit={() => { setEditHabit(habit); setShowForm(true) }}
                    onDelete={() => {
                      if (confirm('Delete this habit?')) deleteHabit.mutate(habit.id)
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Habit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <HabitForm
            habit={editHabit}
            onClose={() => { setShowForm(false); setEditHabit(null) }}
            onSave={() => {
              setShowForm(false)
              setEditHabit(null)
              qc.invalidateQueries({ queryKey: ['habits-today'] })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function HabitCard({ habit, onToggle, onEdit, onDelete }: any) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        habit.completedToday
          ? 'bg-white/2 border-white/5'
          : 'bg-white/3 border-white/8 hover:border-white/16'
      }`}
    >
      <button
        onClick={onToggle}
        className="habit-check flex-shrink-0"
        style={habit.completedToday ? { background: habit.color, borderColor: 'transparent' } : { borderColor: `${habit.color}60` }}
      >
        <AnimatePresence>
          {habit.completedToday && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={14} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <span className="text-xl">{habit.icon}</span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${habit.completedToday ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-slate-600 truncate mt-0.5">{habit.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="btn btn-ghost btn-icon text-slate-500 hover:text-slate-300">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="btn btn-ghost btn-icon text-slate-500 hover:text-rose-400">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function HabitForm({ habit, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || 'HEALTH',
    icon: habit?.icon || '⭐',
    color: habit?.color || '#7c3aed',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (habit) {
        await api.put(`/habits/${habit.id}`, formData)
        toast.success('Habit updated!')
      } else {
        await api.post('/habits', formData)
        toast.success('Habit created! 🎯')
      }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save habit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Habit Name</label>
            <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Morning Meditation" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
            <input value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this habit about?" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
            <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="input-field">
              {['MORNING', 'PRODUCTIVITY', 'HEALTH', 'NIGHT', 'CUSTOM'].map((c) => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Icon (emoji)</label>
              <input value={formData.icon} onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                className="input-field text-center text-2xl" maxLength={2} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Color</label>
              <input type="color" value={formData.color}
                onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                className="w-full h-[42px] rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : habit ? 'Update' : 'Create Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
