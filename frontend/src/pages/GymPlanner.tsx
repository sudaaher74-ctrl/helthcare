import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Play, X, ChevronLeft, ChevronRight, Check, Timer,
  RotateCcw, Info, CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import MuscleMap, { defaultViewFor } from '@/components/gym/MuscleMap'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MUSCLE_LABEL: Record<string, string> = {
  CHEST: 'Chest', BACK: 'Back', LEGS: 'Legs', SHOULDERS: 'Shoulders',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', CORE: 'Core', GLUTES: 'Glutes',
  CALVES: 'Calves', FOREARMS: 'Forearms',
}

// JS getDay(): 0=Sun..6=Sat  →  our weekday: 1=Mon..7=Sun
const todayWeekday = ((new Date().getDay() + 6) % 7) + 1

interface PlanExercise {
  name: string; muscleGroup: string; sets: number; reps: string
  restSeconds: number; steps: string[]; tips?: string | null
}
interface PlanDay {
  weekday: number; title: string; focus: string; isRest: boolean; exercises: PlanExercise[]
}

function categoryFor(day: PlanDay): string {
  const t = `${day.title} ${day.focus}`.toLowerCase()
  if (t.includes('leg')) return 'LEGS'
  if (t.includes('push') || t.includes('chest')) return 'CHEST'
  if (t.includes('pull') || t.includes('back')) return 'BACK'
  if (t.includes('shoulder')) return 'SHOULDERS'
  if (t.includes('core') || t.includes('ab')) return 'CORE'
  return 'FULL_BODY'
}

export default function GymPlanner() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(todayWeekday)
  const [guided, setGuided] = useState<PlanDay | null>(null)

  const { data: plan, isLoading } = useQuery({
    queryKey: ['workout-plan'],
    queryFn: () => api.get('/workout-plan').then((r) => r.data.data),
  })

  const resetPlan = useMutation({
    mutationFn: () => api.post('/workout-plan/reset'),
    onSuccess: () => { toast.success('Plan reset to default split'); qc.invalidateQueries({ queryKey: ['workout-plan'] }) },
  })

  const days: PlanDay[] = plan?.days ?? []
  const day = days.find((d) => d.weekday === selected)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Gym Planner</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Your weekly training schedule · Mon–Sat</p>
        </div>
        <button
          onClick={() => resetPlan.mutate()}
          className="btn btn-ghost btn-sm text-[var(--color-text-muted)]"
        >
          <RotateCcw size={14} /> Reset plan
        </button>
      </div>

      {/* Weekday selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAY_LABELS.map((label, i) => {
          const wd = i + 1
          const d = days.find((x) => x.weekday === wd)
          const isSel = selected === wd
          const isToday = todayWeekday === wd
          return (
            <button
              key={label}
              onClick={() => setSelected(wd)}
              className={`flex flex-col items-center min-w-[64px] px-3 py-2 rounded-xl border transition-colors ${
                isSel
                  ? 'bg-[var(--color-text-base)] text-[var(--color-bg-primary)] border-transparent'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-base)]'
              }`}
            >
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] mt-1 truncate max-w-[56px]">
                {d?.isRest ? 'Rest' : d?.title?.split(' ')[0] ?? '—'}
              </span>
              {isToday && <span className={`mt-1 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-text-base)]'}`} />}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !day ? (
        <div className="glass-card p-10 text-center text-[var(--color-text-muted)]">No plan for this day.</div>
      ) : day.isRest ? (
        <div className="glass-card p-12 text-center">
          <Moon />
          <p className="text-lg font-semibold text-[var(--color-text-base)] mt-3">{day.title}</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{day.focus}</p>
          <p className="text-[var(--color-text-muted)] text-xs mt-4 max-w-sm mx-auto">
            Recovery is when muscle is built. Take a walk, stretch, hydrate, and sleep well.
          </p>
        </div>
      ) : (
        <>
          {/* Day header card */}
          <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl gradient-violet flex items-center justify-center flex-shrink-0">
                <Dumbbell size={20} className="text-[var(--color-text-base)]" />
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--color-text-base)]">{day.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{day.focus} · {day.exercises.length} exercises</p>
              </div>
            </div>
            <button onClick={() => setGuided(day)} className="btn btn-primary">
              <Play size={16} /> Start guided workout
            </button>
          </div>

          {/* Exercise list */}
          <div className="space-y-3">
            {day.exercises.map((ex, i) => (
              <ExerciseCard key={ex.name + i} ex={ex} index={i} />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {guided && (
          <GuidedWorkout
            day={guided}
            onClose={() => setGuided(null)}
            onFinish={() => { setGuided(null); qc.invalidateQueries({ queryKey: ['workouts'] }) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Moon() {
  return <CalendarDays size={40} className="mx-auto text-[var(--color-text-muted)]" />
}

// ─── Exercise card (expandable how-to) ───────────────────────────────────────
function ExerciseCard({ ex, index }: { ex: PlanExercise; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 text-left">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-sm font-bold text-[var(--color-text-muted)] flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-text-base)] truncate">{ex.name}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {ex.sets} sets × {ex.reps} · rest {ex.restSeconds}s
          </p>
        </div>
        <span className="badge badge-violet text-xs whitespace-nowrap">{MUSCLE_LABEL[ex.muscleGroup] ?? ex.muscleGroup}</span>
        <Info size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] grid sm:grid-cols-[auto_1fr] gap-4">
              <div className="flex justify-center">
                <MuscleMap muscle={ex.muscleGroup} size={150} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">How to perform</p>
                <ol className="space-y-1.5">
                  {ex.steps.map((s, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-base)] flex gap-2">
                      <span className="text-[var(--color-text-muted)] font-semibold">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
                {ex.tips && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-3 bg-[var(--color-surface)] rounded-lg px-3 py-2">
                    💡 {ex.tips}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Guided workout player ───────────────────────────────────────────────────
function GuidedWorkout({ day, onClose, onFinish }: { day: PlanDay; onClose: () => void; onFinish: () => void }) {
  const [idx, setIdx] = useState(0)
  const [view, setView] = useState<'front' | 'back'>(defaultViewFor(day.exercises[0]?.muscleGroup))
  // completed[exerciseIndex] = number of sets done
  const [completed, setCompleted] = useState<number[]>(day.exercises.map(() => 0))
  const [rest, setRest] = useState(0) // remaining rest seconds (0 = not resting)
  const startedAt = useMemo(() => new Date(), [])

  const ex = day.exercises[idx]
  const doneSets = completed[idx]
  const isLast = idx === day.exercises.length - 1

  // Rest countdown
  React.useEffect(() => {
    if (rest <= 0) return
    const t = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000)
    return () => clearInterval(t)
  }, [rest])

  const goto = (n: number) => {
    const next = Math.max(0, Math.min(day.exercises.length - 1, n))
    setIdx(next)
    setView(defaultViewFor(day.exercises[next]?.muscleGroup))
    setRest(0)
  }

  const completeSet = () => {
    setCompleted((c) => {
      const copy = [...c]
      copy[idx] = Math.min(ex.sets, copy[idx] + 1)
      return copy
    })
    if (doneSets + 1 < ex.sets) setRest(ex.restSeconds)
  }

  const logWorkout = useMutation({
    mutationFn: () =>
      api.post('/workouts', {
        name: day.title,
        category: categoryFor(day),
        date: new Date().toISOString(),
        startTime: startedAt.toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60000)),
        notes: `Guided: ${day.focus}`,
        exercises: day.exercises.map((e, i) => ({
          name: e.name,
          muscleGroup: e.muscleGroup,
          category: 'STRENGTH',
          sets: Array.from({ length: completed[i] || 0 }).map(() => ({ reps: parseInt(e.reps) || undefined })),
        })),
      }),
    onSuccess: () => { toast.success('Workout logged! 💪'); onFinish() },
    onError: () => toast.error('Could not save workout'),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[var(--color-bg-primary)]/95 backdrop-blur-md overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto p-5 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">{day.title} · {day.focus}</p>
            <p className="font-bold text-[var(--color-text-base)]">Exercise {idx + 1} of {day.exercises.length}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={20} /></button>
        </div>

        {/* Progress */}
        <div className="progress-bar mt-3">
          <div className="progress-bar-fill gradient-violet" style={{ width: `${((idx) / day.exercises.length) * 100}%` }} />
        </div>

        {/* Muscle map */}
        <div className="flex flex-col items-center mt-5">
          <MuscleMap muscle={ex.muscleGroup} view={view} size={200} />
          <div className="flex gap-2 mt-2">
            {(['front', 'back'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  view === v ? 'bg-[var(--color-text-base)] text-[var(--color-bg-primary)] border-transparent'
                  : 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'
                }`}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* Exercise info */}
        <div className="text-center mt-4">
          <span className="badge badge-violet text-xs">{MUSCLE_LABEL[ex.muscleGroup] ?? ex.muscleGroup}</span>
          <h2 className="text-xl font-bold text-[var(--color-text-base)] mt-2">{ex.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{ex.sets} sets × {ex.reps} · rest {ex.restSeconds}s</p>
        </div>

        {/* Rest timer OR set tracker */}
        {rest > 0 ? (
          <div className="glass-card p-6 mt-5 text-center">
            <Timer size={28} className="mx-auto text-[var(--color-text-base)]" />
            <p className="text-4xl font-extrabold text-[var(--color-text-base)] mt-2 tabular-nums">{rest}s</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Rest before your next set</p>
            <button onClick={() => setRest(0)} className="btn btn-secondary btn-sm mt-3">Skip rest</button>
          </div>
        ) : (
          <div className="glass-card p-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--color-text-base)]">Sets</p>
              <p className="text-xs text-[var(--color-text-muted)]">{doneSets}/{ex.sets} done</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: ex.sets }).map((_, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border ${
                    i < doneSets
                      ? 'bg-[var(--color-text-base)] text-[var(--color-bg-primary)] border-transparent'
                      : 'text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'
                  }`}
                >
                  {i < doneSets ? <Check size={16} /> : i + 1}
                </div>
              ))}
            </div>
            {doneSets < ex.sets ? (
              <button onClick={completeSet} className="btn btn-primary w-full mt-4">
                <Check size={16} /> Complete set {doneSets + 1}
              </button>
            ) : (
              <p className="text-center text-sm text-[var(--color-text-muted)] mt-4 flex items-center justify-center gap-1">
                <Check size={16} /> All sets done — great work!
              </p>
            )}
          </div>
        )}

        {/* Steps */}
        <div className="glass-card p-5 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Step by step</p>
          <ol className="space-y-1.5">
            {ex.steps.map((s, i) => (
              <li key={i} className="text-sm text-[var(--color-text-base)] flex gap-2">
                <span className="text-[var(--color-text-muted)] font-semibold">{i + 1}.</span>{s}
              </li>
            ))}
          </ol>
          {ex.tips && <p className="text-xs text-[var(--color-text-muted)] mt-3 bg-[var(--color-surface)] rounded-lg px-3 py-2">💡 {ex.tips}</p>}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between gap-3 mt-5 pb-2">
          <button onClick={() => goto(idx - 1)} disabled={idx === 0} className="btn btn-secondary disabled:opacity-40">
            <ChevronLeft size={16} /> Prev
          </button>
          {isLast ? (
            <button onClick={() => logWorkout.mutate()} disabled={logWorkout.isPending} className="btn btn-primary flex-1 justify-center">
              <Check size={16} /> Finish & log workout
            </button>
          ) : (
            <button onClick={() => goto(idx + 1)} className="btn btn-primary flex-1 justify-center">
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
