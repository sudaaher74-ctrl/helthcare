import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, addDays, subDays, startOfWeek, eachDayOfInterval, isSameDay
} from 'date-fns'
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, Target, Apple,
  Dumbbell, Moon, Scale, CheckSquare, Sparkles, Clock
} from 'lucide-react'
import api from '@/lib/api'
import { PremiumCard } from '@/components/ui/PremiumCard'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const formattedDate = format(selectedDate, 'yyyy-MM-dd')

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', formattedDate],
    queryFn: () => api.get(`/calendar/${formattedDate}`).then((r) => r.data.data),
  })

  // Generate current week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  })

  const { habitLogs = [], meals = [], workouts = [], weightLog, sleepLog, tasks = [] } = data || {}

  const totalCalories = meals.reduce((sum: number, m: any) => sum + (m.totalCalories || 0), 0)
  const totalProtein = meals.reduce((sum: number, m: any) => sum + (m.totalProtein || 0), 0)

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Header & Navigation ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[var(--color-text-base-value)]">Life Calendar</h1>
          <p className="text-[var(--color-text-muted-value)] text-sm mt-1">Review your daily logs, nutrition, workouts, and habits</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            className="p-2 rounded-xl bg-[var(--color-bg-secondary-value)] hover:bg-[var(--color-bg-tertiary-value)] border border-[var(--color-border-subtle-value)] transition-colors text-[var(--color-text-base-value)]"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 rounded-xl bg-[var(--color-bg-secondary-value)] hover:bg-[var(--color-bg-tertiary-value)] border border-[var(--color-border-subtle-value)] text-xs font-semibold uppercase tracking-wider text-[var(--color-text-base-value)] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="p-2 rounded-xl bg-[var(--color-bg-secondary-value)] hover:bg-[var(--color-bg-tertiary-value)] border border-[var(--color-border-subtle-value)] transition-colors text-[var(--color-text-base-value)]"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ─── Week Strip Selector ────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center py-3.5 px-2 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                  : 'bg-[var(--color-bg-secondary-value)] text-[var(--color-text-muted-value)] border-[var(--color-border-subtle-value)] hover:text-[var(--color-text-base-value)] hover:border-blue-500/30'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {format(day, 'EEE')}
              </span>
              <span className="text-xl font-bold font-mono mt-1">
                {format(day, 'd')}
              </span>
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* ─── Selected Day Highlights ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-[var(--color-text-base-value)] flex items-center gap-2">
          <CalIcon size={20} className="text-blue-500" />
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        {isSameDay(selectedDate, new Date()) && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Today
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Habits Completed */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Target size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Habits</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--color-text-muted-value)]">
                {habitLogs.filter((l: any) => l.completed).length} Done
              </span>
            </div>

            {habitLogs.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No habits logged for this date</p>
            ) : (
              <div className="space-y-2 mt-auto">
                {habitLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border-subtle-value)]/40 last:border-0">
                    <span className="text-[var(--color-text-base-value)] font-medium flex items-center gap-1.5">
                      <span>{log.habit?.icon || '⭐'}</span> {log.habit?.name || 'Habit'}
                    </span>
                    <span className={log.completed ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {log.completed ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>

          {/* Nutrition Summary */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Apple size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Nutrition</h3>
              </div>
              <span className="font-mono text-xs font-bold text-orange-400">
                {Math.round(totalCalories)} kcal
              </span>
            </div>

            {meals.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No meals recorded on this date</p>
            ) : (
              <div className="space-y-2 mt-auto">
                <div className="text-[11px] text-[var(--color-text-muted-value)] mb-2">
                  Protein: <span className="font-mono text-[var(--color-text-base-value)] font-semibold">{Math.round(totalProtein)}g</span> · {meals.length} meal(s)
                </div>
                {meals.map((meal: any) => (
                  <div key={meal.id} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border-subtle-value)]/40 last:border-0">
                    <span className="text-[var(--color-text-base-value)] font-medium truncate max-w-[150px]">
                      {meal.name || meal.mealType}
                    </span>
                    <span className="font-mono text-[var(--color-text-muted-value)] font-bold">
                      {Math.round(meal.totalCalories)} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>

          {/* Workouts */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <Dumbbell size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Workouts</h3>
              </div>
              <span className="font-mono text-xs font-bold text-red-400">
                {workouts.length} Session{workouts.length === 1 ? '' : 's'}
              </span>
            </div>

            {workouts.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No workouts recorded for this date</p>
            ) : (
              <div className="space-y-2 mt-auto">
                {workouts.map((w: any) => (
                  <div key={w.id} className="p-2 rounded-xl bg-[var(--color-bg-secondary-value)]/50 border border-[var(--color-border-subtle-value)]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-base-value)]">
                      <span>{w.name}</span>
                      <span className="text-red-400">{w.durationMinutes || 0} min</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted-value)] mt-0.5">
                      {w.category} · {w.exercises?.length || 0} exercises
                    </p>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>

          {/* Sleep Recovery */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Moon size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Sleep</h3>
              </div>
              {sleepLog && (
                <span className="font-mono text-xs font-bold text-purple-400">
                  ⭐ {sleepLog.quality}/5
                </span>
              )}
            </div>

            {!sleepLog ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No sleep logged for this date</p>
            ) : (
              <div className="mt-auto">
                <div className="font-mono text-3xl font-bold text-[var(--color-text-base-value)]">
                  {(sleepLog.durationMinutes / 60).toFixed(1)} <span className="text-xs text-[var(--color-text-muted-value)] font-sans">hours</span>
                </div>
                {sleepLog.notes && (
                  <p className="text-xs text-[var(--color-text-muted-value)] mt-2 italic">"{sleepLog.notes}"</p>
                )}
              </div>
            )}
          </PremiumCard>

          {/* Weight */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Scale size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Weight</h3>
              </div>
            </div>

            {!weightLog ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No weight logged for this date</p>
            ) : (
              <div className="mt-auto">
                <div className="font-mono text-3xl font-bold text-[var(--color-text-base-value)]">
                  {weightLog.weight} <span className="text-xs text-[var(--color-text-muted-value)] font-sans">kg</span>
                </div>
                {weightLog.bodyFat && (
                  <p className="text-xs text-[var(--color-text-muted-value)] mt-1">Body Fat: {weightLog.bodyFat}%</p>
                )}
              </div>
            )}
          </PremiumCard>

          {/* Tasks Scheduled / Completed */}
          <PremiumCard hoverAction className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CheckSquare size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-base-value)]">Tasks</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--color-text-muted-value)]">
                {tasks.length} Task{tasks.length === 1 ? '' : 's'}
              </span>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted-value)] mt-auto py-4 text-center">No tasks scheduled for this date</p>
            ) : (
              <div className="space-y-1.5 mt-auto">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border-subtle-value)]/40 last:border-0">
                    <span className={`truncate max-w-[160px] font-medium ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-[var(--color-text-base-value)]'}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted-value)]">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      )}
    </div>
  )
}
