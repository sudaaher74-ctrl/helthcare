import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trophy, Trash2, CheckCircle, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'

const CATEGORIES = ['FITNESS','BUSINESS','LEARNING','PERSONAL','HEALTH','FINANCE']
const CAT_ICONS: Record<string,string> = { FITNESS:'💪', BUSINESS:'💼', LEARNING:'📚', PERSONAL:'❤️', HEALTH:'🏥', FINANCE:'💰' }

export default function GoalsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then(r => r.data.data),
  })

  const deleteGoal = useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => { toast.success('Goal deleted'); qc.invalidateQueries({ queryKey: ['goals'] }) },
  })

  const updateGoal = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/goals/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const active = (goals || []).filter((g: any) => g.status !== 'COMPLETED' && g.status !== 'CANCELLED')
  const completed = (goals || []).filter((g: any) => g.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-slate-400 text-sm">{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
      ) : goals?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Trophy size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 font-semibold">No goals yet</p>
          <p className="text-slate-500 text-sm mt-1">Set goals to track your progress</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4"><Plus size={16} /> Create First Goal</button>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((goal: any) => {
            const pct = goal.targetValue ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0
            const completedMilestones = goal.milestones?.filter((m: any) => m.isCompleted).length || 0
            return (
              <div key={goal.id} className="glass-card p-5 glass-card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{goal.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {CAT_ICONS[goal.category]} {goal.category.toLowerCase()}
                        {goal.targetDate ? ` · Due ${format(new Date(goal.targetDate), 'MMM d, yyyy')}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateGoal.mutate({ id: goal.id, data: { status: 'COMPLETED', completedAt: new Date() } })}
                      className="btn btn-ghost btn-icon text-slate-500 hover:text-emerald-400">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => deleteGoal.mutate(goal.id)} className="btn btn-ghost btn-icon text-slate-500 hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {goal.description && <p className="text-sm text-slate-400 mb-3">{goal.description}</p>}

                {goal.targetValue && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold" style={{ color: goal.color }}>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <motion.div className="progress-bar-fill" style={{ background: goal.color, width: `${pct}%` }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{Math.round(pct)}% complete</p>
                  </div>
                )}

                {goal.milestones?.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {goal.milestones.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs">
                        <button onClick={() => api.put(`/goals/${goal.id}/milestones/${m.id}`, { isCompleted: !m.isCompleted })
                          .then(() => qc.invalidateQueries({ queryKey: ['goals'] }))}
                          className={`w-4 h-4 rounded flex-shrink-0 border transition-all flex items-center justify-center ${m.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                          {m.isCompleted && <CheckCircle size={10} className="text-white" />}
                        </button>
                        <span className={m.isCompleted ? 'line-through text-slate-600' : 'text-slate-300'}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">✅ Completed</h3>
              {completed.map((g: any) => (
                <div key={g.id} className="glass-card p-3 flex items-center gap-3 opacity-60 mb-2">
                  <span className="text-xl">{g.icon}</span>
                  <p className="text-sm line-through text-slate-400 flex-1">{g.title}</p>
                  <span className="badge badge-emerald text-xs">Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <GoalForm
            onClose={() => setShowForm(false)}
            onSave={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['goals'] }) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function GoalForm({ onClose, onSave }: any) {
  const [form, setForm] = useState({ title: '', description: '', category: 'FITNESS', icon: '🎯', color: '#7c3aed', targetValue: '', unit: '', targetDate: '' })
  const [milestones, setMilestones] = useState([{ title: '' }])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/goals', {
        ...form,
        targetValue: form.targetValue ? parseFloat(form.targetValue) : undefined,
        targetDate: form.targetDate || undefined,
        milestones: milestones.filter(m => m.title.trim()),
      })
      toast.success('Goal created! 🎯')
      onSave()
    } catch { toast.error('Failed to create goal') } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="modal-content max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4">Create New Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="Goal title" className="input-field" required />
          <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Description (optional)" className="input-field resize-none h-20" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Target Date</label>
              <input type="date" value={form.targetDate} onChange={e => setForm(p=>({...p,targetDate:e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Target Value</label>
              <input type="number" value={form.targetValue} onChange={e => setForm(p=>({...p,targetValue:e.target.value}))} placeholder="e.g. 55" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Unit</label>
              <input value={form.unit} onChange={e => setForm(p=>({...p,unit:e.target.value}))} placeholder="kg, km, ..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Milestones</label>
            {milestones.map((m, i) => (
              <input key={i} value={m.title} onChange={e => setMilestones(p => p.map((x,xi) => xi===i ? {...x,title:e.target.value} : x))}
                placeholder={`Milestone ${i+1}`} className="input-field mb-2 text-sm" />
            ))}
            <button type="button" onClick={() => setMilestones(p => [...p, { title: '' }])} className="text-xs text-violet-400 hover:text-violet-300">
              + Add Milestone
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Creating...' : 'Create Goal 🎯'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
