import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle, Clock, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'

export default function TasksPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data.data.tasks || r.data.data),
  })

  const completeTask = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const PRIORITY_COLORS: Record<string, string> = { URGENT: 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]', HIGH: 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]', MEDIUM: 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]', LOW: 'text-[var(--color-text-muted)] border-slate-400/30' }

  const backlog = (tasks || []).filter((t: any) => t.status === 'BACKLOG')
  const inProgress = (tasks || []).filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW')
  const done = (tasks || []).filter((t: any) => t.status === 'DONE')

  const totalTasks = (tasks || []).length
  const doneTasks = done.length
  const focusScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Tasks</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{inProgress.length} in progress · {done.length} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16}/> New Task</button>
      </div>

      {/* Focus Score */}
      <div className="glass-card p-5 border-l-4 border-l-violet-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--color-border-subtle)]">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Daily Focus Score</h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[var(--color-text-base)]">{focusScore}</span>
              <span className="text-[var(--color-text-muted)] font-bold mb-1">/ 100</span>
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-300">Keep knocking them out!</p>
          <p className="text-xs text-[var(--color-text-muted)]">+10 XP per completed task</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <Column title="To Do" tasks={backlog} color="violet" onComplete={(id: string) => completeTask.mutate({ id, status: 'DONE' })} onDelete={(id: string) => deleteTask.mutate(id)} pColors={PRIORITY_COLORS} />
        <Column title="In Progress" tasks={inProgress} color="amber" onComplete={(id: string) => completeTask.mutate({ id, status: 'DONE' })} onDelete={(id: string) => deleteTask.mutate(id)} pColors={PRIORITY_COLORS} />
        <Column title="Done" tasks={done} color="emerald" isDone onComplete={(id: string) => completeTask.mutate({ id, status: 'BACKLOG' })} onDelete={(id: string) => deleteTask.mutate(id)} pColors={PRIORITY_COLORS} />
      </div>
      
      <AnimatePresence>
        {showForm && (
          <TaskForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['tasks'] }) }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Column({ title, tasks, color, onComplete, onDelete, pColors, isDone }: any) {
  return (
    <div className={`glass-card p-4 min-h-[400px] border-t-4 border-t-${color}-500`}>
      <h3 className="font-bold text-[var(--color-text-base)] mb-3">{title} <span className="text-[var(--color-text-muted)] text-xs font-normal">({tasks.length})</span></h3>
      <div className="space-y-3">
        {tasks.map((t: any) => (
          <motion.div layout key={t.id} className={`glass-card p-3 glass-card-hover ${isDone ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <p className={`text-sm font-semibold text-[var(--color-text-base)] ${isDone ? 'line-through text-[var(--color-text-muted)]' : ''}`}>{t.title}</p>
              <div className="flex gap-1">
                <button onClick={() => onComplete(t.id)} className={`btn-icon btn-ghost ${isDone ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]'}`}><CheckCircle size={14}/></button>
                <button onClick={() => onDelete(t.id)} className="btn-icon btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]"><Trash2 size={14}/></button>
              </div>
            </div>
            {t.description && <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{t.description}</p>}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle)] text-[10px]">
              <span className={`px-1.5 py-0.5 rounded border ${pColors[t.priority]}`}>{t.priority}</span>
              {t.dueDate && <span className="text-[var(--color-text-muted)] flex items-center gap-1"><Calendar size={10}/> {format(new Date(t.dueDate), 'MMM d')}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TaskForm({ onClose, onSave }: any) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [saving, setSaving] = useState(false)
  
  const submit = async (e: any) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/tasks', { ...form, dueDate: form.dueDate || undefined })
      toast.success('Task created!')
      onSave()
    } catch { toast.error('Failed to create task') } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="modal-content">
        <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4">New Task</h3>
        <form onSubmit={submit} className="space-y-4">
          <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="Task title" className="input-field" required />
          <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Description" className="input-field h-20" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="input-field">
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setForm(p=>({...p,dueDate:e.target.value}))} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">{saving ? '...' : 'Create'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
