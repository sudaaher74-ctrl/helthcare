import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Scale, Flame, Droplets, Dumbbell, Moon, CheckCircle2,
  TrendingUp, ArrowRight, Target, Zap, Award, Plus
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import ScoreRing from '@/components/dashboard/ScoreRing'
import MacroBar from '@/components/dashboard/MacroBar'

export default function Dashboard() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
  })

  const completeHabit = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.post(`/habits/${id}/complete`, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  })

  if (isLoading) return <DashboardSkeleton />

  const { scores, todayStats, habits, weightHistory, streaks, recentAchievements, motivationalQuote, upcomingTasks, user } = data || {}

  const scoreItems = [
    { label: 'Life Score', value: scores?.lifeScore || 0, color: '#7c3aed', gradient: 'gradient-violet', icon: '⚡' },
    { label: 'Health', value: scores?.healthScore || 0, color: '#10b981', gradient: 'gradient-health', icon: '❤️' },
    { label: 'Nutrition', value: scores?.nutritionScore || 0, color: '#06b6d4', gradient: 'gradient-nutrition', icon: '🥗' },
    { label: 'Discipline', value: scores?.disciplineScore || 0, color: '#f59e0b', gradient: 'gradient-discipline', icon: '🎯' },
    { label: 'Productivity', value: scores?.productivityScore || 0, color: '#f97316', gradient: 'gradient-productivity', icon: '⚡' },
  ]

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/nutrition" className="btn btn-primary btn-sm hidden sm:flex">
          <Plus size={15} />
          Log Meal
        </Link>
      </div>

      {/* Motivational Quote */}
      {motivationalQuote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-5 py-4 border-l-2 border-violet-500"
        >
          <p className="text-sm text-slate-300 italic">"{motivationalQuote.quote}"</p>
          <p className="text-xs text-slate-500 mt-1">— {motivationalQuote.author}</p>
        </motion.div>
      )}

      {/* Score Rings */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Life Scores</h2>
        <div className="grid grid-cols-5 gap-3 stagger-children">
          {scoreItems.map((item) => (
            <ScoreRing key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Today's Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
          <StatCard
            icon={<Scale size={18} className="text-violet-400" />}
            label="Current Weight"
            value={`${todayStats?.currentWeight || '--'} kg`}
            sub={todayStats?.weightRemaining ? `${todayStats.weightRemaining}kg to goal` : 'Goal not set'}
            color="text-violet-400"
          />
          <StatCard
            icon={<Flame size={18} className="text-orange-400" />}
            label="Calories"
            value={`${todayStats?.calories || 0}`}
            sub={`of ${todayStats?.calorieGoal || 2800} kcal`}
            color="text-orange-400"
            percent={todayStats?.calories && todayStats?.calorieGoal
              ? Math.min(100, (todayStats.calories / todayStats.calorieGoal) * 100) : 0}
          />
          <StatCard
            icon={<span className="text-lg">🥩</span>}
            label="Protein"
            value={`${todayStats?.protein || 0}g`}
            sub={`of ${todayStats?.proteinGoal || 150}g`}
            color="text-cyan-400"
            percent={todayStats?.protein && todayStats?.proteinGoal
              ? Math.min(100, (todayStats.protein / todayStats.proteinGoal) * 100) : 0}
          />
          <StatCard
            icon={<Droplets size={18} className="text-blue-400" />}
            label="Water"
            value={`${todayStats?.water || 0}L`}
            sub={`of ${todayStats?.waterGoal || 3}L`}
            color="text-blue-400"
            percent={todayStats?.water && todayStats?.waterGoal
              ? Math.min(100, (todayStats.water / todayStats.waterGoal) * 100) : 0}
          />
          <StatCard
            icon={<Target size={18} className="text-amber-400" />}
            label="Habits"
            value={`${todayStats?.habitsCompleted || 0}/${todayStats?.habitsTotal || 0}`}
            sub={`${todayStats?.habitRate || 0}% complete`}
            color="text-amber-400"
            percent={todayStats?.habitRate || 0}
          />
          <StatCard
            icon={<Dumbbell size={18} className="text-emerald-400" />}
            label="Workout"
            value={todayStats?.hasWorkedOut ? 'Done ✓' : 'Not yet'}
            sub={todayStats?.hasWorkedOut ? 'Great work!' : 'Time to train!'}
            color={todayStats?.hasWorkedOut ? 'text-emerald-400' : 'text-slate-500'}
          />
          <StatCard
            icon={<Moon size={18} className="text-indigo-400" />}
            label="Sleep"
            value={todayStats?.sleepHours ? `${todayStats.sleepHours}h` : '--'}
            sub={todayStats?.sleepHours ? getSleepLabel(todayStats.sleepHours) : 'Not logged'}
            color="text-indigo-400"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-rose-400" />}
            label="Weight Goal"
            value={todayStats?.targetWeight ? `${todayStats.targetWeight} kg` : '--'}
            sub={todayStats?.weightRemaining
              ? `${todayStats.weightRemaining}kg remaining`
              : 'Set your goal'}
            color="text-rose-400"
          />
        </div>
      </div>

      {/* Main Grid — Habits + Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              Today's Habits
            </h2>
            <Link to="/habits" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {habits?.slice(0, 8).map((habit: any) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={() => completeHabit.mutate({ id: habit.id, completed: !habit.completed })}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {todayStats?.habitsCompleted}/{todayStats?.habitsTotal} completed
              </span>
              <div className="flex gap-1">
                {Array.from({ length: todayStats?.habitsTotal || 0 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${
                    i < (todayStats?.habitsCompleted || 0) ? 'bg-violet-500' : 'bg-white/10'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Nutrition Today
            </h2>
            <Link to="/nutrition" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Log food <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3.5">
            <MacroBar
              label="Calories"
              current={todayStats?.calories || 0}
              goal={todayStats?.calorieGoal || 2800}
              unit="kcal"
              color="#f97316"
              gradient="from-orange-500 to-amber-500"
            />
            <MacroBar
              label="Protein"
              current={todayStats?.protein || 0}
              goal={todayStats?.proteinGoal || 150}
              unit="g"
              color="#06b6d4"
              gradient="from-cyan-500 to-blue-500"
            />
            <MacroBar
              label="Water"
              current={todayStats?.water || 0}
              goal={todayStats?.waterGoal || 3}
              unit="L"
              color="#3b82f6"
              gradient="from-blue-500 to-indigo-500"
            />
          </div>

          {/* Quick add water */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-2">Quick add water:</p>
            <div className="flex gap-2">
              {[250, 500, 750].map((ml) => (
                <button key={ml}
                  onClick={() => logWater(ml, qc)}
                  className="btn btn-secondary btn-sm flex-1 text-xs">
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight + Streaks + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Trend */}
        <div className="glass-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Scale size={16} className="text-violet-400" />
              Weight Trend
            </h2>
            <Link to="/weight" className="text-xs text-violet-400 hover:text-violet-300">
              <ArrowRight size={14} />
            </Link>
          </div>
          {weightHistory && weightHistory.length > 0 ? (
            <MiniWeightChart data={weightHistory} target={todayStats?.targetWeight} />
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-slate-500">
              <Scale size={24} className="mb-2 opacity-50" />
              <p className="text-xs">No weight logged yet</p>
              <Link to="/weight" className="text-xs text-violet-400 mt-1">Log your weight →</Link>
            </div>
          )}
        </div>

        {/* Streaks */}
        <div className="glass-card p-5">
          <h2 className="font-bold text-white flex items-center gap-2 mb-3">
            <span className="streak-fire">🔥</span>
            Active Streaks
          </h2>
          <div className="space-y-2.5">
            {(streaks || []).map((s: any) => (
              <div key={s.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getStreakIcon(s.type)}</span>
                  <span className="text-sm text-slate-300 capitalize">
                    {s.type.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${s.currentStreak > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                    {s.currentStreak}
                  </span>
                  <span className="text-xs text-slate-600">/ {s.longestStreak} best</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Upcoming Tasks
            </h2>
            <Link to="/tasks" className="text-xs text-violet-400 hover:text-violet-300">
              <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingTasks?.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks?.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                  <span className="text-sm text-slate-300 truncate flex-1">{task.title}</span>
                  <span className={`badge badge-${getCategoryBadge(task.category)} text-[10px]`}>
                    {task.category.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-slate-500">
              <CheckCircle2 size={24} className="mb-2 opacity-50" />
              <p className="text-xs">All caught up! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements?.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              Recent Achievements
            </h2>
            <Link to="/achievements" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentAchievements?.map((ua: any) => (
              <div key={ua.id} className="flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 min-w-[80px]">
                <span className="text-2xl">{ua.achievement.icon}</span>
                <p className="text-[10px] text-amber-300 font-semibold text-center leading-tight">
                  {ua.achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub Components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, percent }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
        {percent !== undefined && (
          <span className={`text-xs font-bold ${color}`}>{Math.round(percent)}%</span>
        )}
      </div>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function HabitRow({ habit, onToggle }: any) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div
        className="habit-check"
        style={habit.completed ? { background: habit.color, borderColor: habit.color } : undefined}
      >
        {habit.completed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <CheckCircle2 size={14} className="text-white" />
          </motion.div>
        )}
      </div>
      <span className="text-base">{habit.icon}</span>
      <span className={`text-sm flex-1 ${habit.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
        {habit.name}
      </span>
      <span className="text-[10px] text-slate-600 capitalize">
        {habit.category.toLowerCase()}
      </span>
    </motion.div>
  )
}

function MacroBarMini() { return null }

function MiniWeightChart({ data, target }: { data: any[]; target?: number }) {
  if (!data.length) return null
  const weights = data.map((d) => d.weight)
  const min = Math.min(...weights) - 1
  const max = Math.max(...weights, target || 0) + 1
  const range = max - min

  return (
    <div className="relative h-20">
      <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
        {/* Target line */}
        {target && (
          <line
            x1="0" y1={((max - target) / range) * 60}
            x2="200" y2={((max - target) / range) * 60}
            stroke="#7c3aed" strokeWidth="1" strokeDasharray="4,2" opacity="0.5"
          />
        )}
        {/* Weight line */}
        <polyline
          points={data.map((d, i) => `${(i / (data.length - 1)) * 200},${((max - d.weight) / range) * 60}`).join(' ')}
          fill="none" stroke="#10b981" strokeWidth="2"
        />
        {/* Last point dot */}
        {data.length > 0 && (
          <circle
            cx="200" cy={((max - data[data.length - 1].weight) / range) * 60}
            r="3" fill="#10b981"
          />
        )}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-600 mt-1">
        <span>{data[0]?.weight}kg</span>
        <span className="text-emerald-400 font-bold">{data[data.length - 1]?.weight}kg</span>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="grid grid-cols-5 gap-3">
        {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    </div>
  )
}

async function logWater(ml: number, qc: any) {
  try {
    await api.post('/nutrition/water', { amountML: ml })
    toast.success(`💧 +${ml}ml logged!`)
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  } catch {
    toast.error('Failed to log water')
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getSleepLabel(hours: number) {
  if (hours >= 8) return 'Excellent rest 💎'
  if (hours >= 7) return 'Good sleep 👍'
  if (hours >= 6) return 'Could be better'
  return 'Need more sleep! 😴'
}

function getStreakIcon(type: string) {
  const icons: Record<string, string> = {
    HABIT: '🎯', WORKOUT: '💪', DIET: '🥗', SLEEP: '😴', PRODUCTIVITY: '⚡'
  }
  return icons[type] || '🔥'
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    URGENT: 'bg-rose-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-amber-500', LOW: 'bg-slate-500'
  }
  return colors[priority] || 'bg-slate-500'
}

function getCategoryBadge(cat: string) {
  const map: Record<string, string> = {
    BUSINESS: 'violet', LEARNING: 'cyan', PERSONAL: 'emerald',
    HEALTH: 'rose', FINANCE: 'amber',
  }
  return map[cat] || 'violet'
}
