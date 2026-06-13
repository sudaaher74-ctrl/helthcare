import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Dumbbell, Trash2, Timer, Award, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'

const CATEGORIES = ['CHEST','BACK','LEGS','SHOULDERS','ARMS','CARDIO','FULL_BODY','CORE']
const CAT_ICONS: Record<string,string> = {
  CHEST:'💪',BACK:'🏋️',LEGS:'🦵',SHOULDERS:'🤸',ARMS:'💪',CARDIO:'🏃',FULL_BODY:'⚡',CORE:'🔥'
}

export default function WorkoutTracker() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts?limit=20').then(r => r.data.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['workout-stats'],
    queryFn: () => api.get('/workouts/stats').then(r => r.data.data),
  })

  const deleteWorkout = useMutation({
    mutationFn: (id: string) => api.delete(`/workouts/${id}`),
    onSuccess: () => { toast.success('Workout deleted'); qc.invalidateQueries({ queryKey: ['workouts'] }) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Workout Tracker</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'This Month', value: stats.totalSessions, unit: 'sessions', icon: '🏋️', color: 'text-violet-400' },
            { label: 'Total Time', value: Math.round(stats.totalMinutes / 60), unit: 'hours', icon: '⏱️', color: 'text-amber-400' },
            { label: 'Calories', value: stats.totalCalories, unit: 'kcal', icon: '🔥', color: 'text-orange-400' },
            { label: 'Fav Category', value: Object.entries(stats.byCategory||{}).sort((a:any,b:any) => b[1]-a[1])[0]?.[0]?.toLowerCase() || '--', unit: '', icon: '⭐', color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="text-2xl">{s.icon}</span>
              <p className={`text-2xl font-extrabold mt-2 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{s.unit}</p>
              <p className="text-xs text-slate-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Workout List */}
      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : workouts?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Dumbbell size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 font-semibold text-lg">No workouts logged yet</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Start tracking your training today!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
            <Plus size={16} /> Log First Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts?.map((w: any) => (
            <motion.div key={w.id} layout className="glass-card p-4 glass-card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center text-lg flex-shrink-0">
                    {CAT_ICONS[w.category] || '💪'}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-base)]">{w.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {format(new Date(w.date), 'MMM d')} · {w.durationMinutes}min
                      {w.caloriesBurned ? ` · ${w.caloriesBurned} kcal` : ''}
                      {w.exercises?.length ? ` · ${w.exercises.length} exercises` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge badge-violet text-xs`}>
                    {w.category.replace('_',' ').toLowerCase()}
                  </span>
                  <button onClick={() => deleteWorkout.mutate(w.id)} className="btn btn-ghost btn-icon text-[var(--color-text-muted)] hover:text-rose-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {w.exercises?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-2">
                  {w.exercises.slice(0,4).map((ex: any) => (
                    <span key={ex.id} className="text-xs bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-lg px-2 py-1">
                      {ex.name} {ex.sets?.length ? `× ${ex.sets.length} sets` : ''}
                    </span>
                  ))}
                  {w.exercises.length > 4 && (
                    <span className="text-xs text-slate-600">+{w.exercises.length - 4} more</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Workout Modal */}
      <AnimatePresence>
        {showForm && (
          <LogWorkoutModal
            onClose={() => setShowForm(false)}
            onSave={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['workouts', 'workout-stats', 'dashboard'] }) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function LogWorkoutModal({ onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: '', category: 'CHEST', date: format(new Date(), 'yyyy-MM-dd'),
    durationMinutes: '', caloriesBurned: '', notes: '', mood: 4,
  })
  const [exercises, setExercises] = useState([{ name: '', sets: [{ reps: '', weight: '' }] }])
  const [saving, setSaving] = useState(false)

  const addExercise = () => setExercises(p => [...p, { name: '', sets: [{ reps: '', weight: '' }] }])
  const addSet = (ei: number) => setExercises(p => p.map((e,i) => i === ei ? {...e, sets: [...e.sets, { reps: '', weight: '' }]} : e))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/workouts', {
        ...form,
        durationMinutes: parseInt(form.durationMinutes) || 60,
        caloriesBurned: parseInt(form.caloriesBurned) || undefined,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets.map((s,i) => ({ setNumber: i+1, reps: parseInt(s.reps)||0, weight: parseFloat(s.weight)||0 }))
        }))
      })
      toast.success('Workout logged! 💪')
      onSave()
    } catch { toast.error('Failed to log workout') } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        className="modal-content max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4">Log Workout</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
            placeholder="Workout name (e.g. Push Day)" className="input-field" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.replace('_',' ').toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Duration (min)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm(p=>({...p,durationMinutes:e.target.value}))} placeholder="60" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Calories Burned</label>
              <input type="number" value={form.caloriesBurned} onChange={e => setForm(p=>({...p,caloriesBurned:e.target.value}))} placeholder="300" className="input-field" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Exercises</label>
              <button type="button" onClick={addExercise} className="btn btn-secondary btn-sm text-xs">
                <Plus size={12} /> Add Exercise
              </button>
            </div>
            {exercises.map((ex, ei) => (
              <div key={ei} className="p-3 bg-white/3 rounded-xl mb-2 space-y-2">
                <input value={ex.name} onChange={e => setExercises(p => p.map((x,i) => i===ei ? {...x,name:e.target.value} : x))}
                  placeholder="Exercise name (e.g. Bench Press)" className="input-field text-sm" />
                {ex.sets.map((s, si) => (
                  <div key={si} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Set {si+1}</span>
                    <input type="number" value={s.reps} onChange={e => setExercises(p => p.map((x,i) => i===ei ? {...x, sets: x.sets.map((ss,ssi) => ssi===si ? {...ss, reps: e.target.value} : ss)} : x))}
                      placeholder="Reps" className="input-field text-sm" />
                    <input type="number" value={s.weight} onChange={e => setExercises(p => p.map((x,i) => i===ei ? {...x, sets: x.sets.map((ss,ssi) => ssi===si ? {...ss, weight: e.target.value} : ss)} : x))}
                      placeholder="kg" className="input-field text-sm" step="0.5" />
                  </div>
                ))}
                <button type="button" onClick={() => addSet(ei)} className="text-xs text-violet-400 hover:text-violet-300">
                  + Add set
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : 'Log Workout 💪'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
