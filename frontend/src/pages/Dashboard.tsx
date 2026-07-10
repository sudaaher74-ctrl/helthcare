import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Scale, Flame, Droplets, Dumbbell, Moon, CheckCircle2,
  TrendingUp, ArrowRight, Target, Zap, Award, Sparkles,
  Wallet, ChevronRight, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { AnimatedProgress } from '@/components/ui/AnimatedProgress'

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

  const { scores, todayStats, habits, weightHistory, streaks, recentAchievements, upcomingTasks, user, gamification, todaysMission, aiCoach } = data || {}

  const scoreItems = [
    { label: 'Health', value: scores?.healthScore || 0, color: '#10b981' },
    { label: 'Nutrition', value: scores?.nutritionScore || 0, color: '#f97316' },
    { label: 'Discipline', value: scores?.disciplineScore || 0, color: '#f59e0b' },
    { label: 'Productivity', value: scores?.productivityScore || 0, color: '#8b5cf6' },
  ]

  const totalMission = todaysMission?.total || 4;
  const progressMission = todaysMission?.progress || 0;
  const missionPercent = (progressMission / totalMission) * 100;

  return (
    <div className="space-y-12 pb-12">
      {/* ─── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative">
        <PremiumCard className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 border-none !p-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 relative z-10">
            {/* Left: Greeting & Mission */}
            <div className="lg:col-span-5 flex flex-col justify-center text-white space-y-6">
              <div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles size={14} className="text-blue-300" /> AI Insights Active
                </motion.div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  Good {getGreeting()},<br/>{user?.name?.split(' ')[0]}
                </h1>
                <p className="text-blue-200 text-sm md:text-base font-medium max-w-sm leading-relaxed">
                  {aiCoach?.message || "Good sleep yesterday. Drink 800ml more water. Workout scheduled at 6PM. You spent $45 yesterday. Goal progress is improving."}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-100">Today's Mission</span>
                  <span className="font-mono text-sm font-bold">{progressMission}/{totalMission}</span>
                </div>
                <AnimatedProgress progress={missionPercent} color="bg-white" height={6} className="bg-white/20" />
                
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 bg-white text-blue-900 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 text-sm">
                    Log Workout
                  </button>
                  <button className="flex-1 bg-white/10 text-white border border-white/20 font-semibold py-3 px-4 rounded-xl hover:bg-white/20 transition-colors text-sm">
                    Log Water
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Life Score */}
            <div className="lg:col-span-7 flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[80px] rounded-full opacity-40"></div>
                
                {/* Score Circle */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
                  <svg className="w-[90%] h-[90%] transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <motion.circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="#60a5fa" strokeWidth="6" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 283" }}
                      animate={{ strokeDasharray: `${(scores?.lifeScore || 0) * 2.83} 283` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{ filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.8))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-blue-200 mb-1">Life Score</span>
                    <span className="font-heading text-6xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-md">
                      {scores?.lifeScore || 0}
                    </span>
                    <span className="text-xs text-blue-200 font-medium mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                      Top 10%
                    </span>
                  </div>
                </div>

                {/* Orbiting Sub-scores (Simplified for design) */}
                <div className="absolute top-0 -left-4 bg-white text-black px-3 py-1.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2 text-xs font-bold transform -rotate-6">
                  <span className="text-[#10b981]">●</span> {scores?.healthScore || 0} Health
                </div>
                <div className="absolute bottom-10 -right-8 bg-[#111111] text-white px-3 py-1.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-2 text-xs font-bold transform rotate-3">
                  <span className="text-[#f97316]">●</span> {scores?.nutritionScore || 0} Food
                </div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </section>

      {/* ─── 2. TIMELINE ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] tracking-tight">Today's Timeline</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PremiumCard className="!p-5 border-l-4 border-l-blue-500" hoverAction>
            <div className="text-[10px] font-mono text-[var(--color-text-muted-value)] mb-2 flex items-center gap-1.5"><Clock size={12}/> 07:00 AM</div>
            <h3 className="font-semibold text-sm mb-1 text-[var(--color-text-base-value)]">Morning Routine</h3>
            <p className="text-xs text-[var(--color-text-muted-value)]">Meditation & Water</p>
          </PremiumCard>
          <PremiumCard className="!p-5 border-l-4 border-l-orange-500" hoverAction>
            <div className="text-[10px] font-mono text-[var(--color-text-muted-value)] mb-2 flex items-center gap-1.5"><Clock size={12}/> 12:30 PM</div>
            <h3 className="font-semibold text-sm mb-1 text-[var(--color-text-base-value)]">High Protein Lunch</h3>
            <p className="text-xs text-[var(--color-text-muted-value)]">Target: 40g Protein</p>
          </PremiumCard>
          <PremiumCard className="!p-5 border-l-4 border-l-red-500 bg-red-500/5 border-red-500/20" hoverAction>
            <div className="text-[10px] font-mono text-red-500 mb-2 flex items-center gap-1.5"><Clock size={12}/> 06:00 PM</div>
            <h3 className="font-semibold text-sm mb-1 text-red-500">Push Workout</h3>
            <p className="text-xs text-red-500/70">Scheduled in Gym Planner</p>
          </PremiumCard>
          <PremiumCard className="!p-5 border-l-4 border-l-purple-500 opacity-60" hoverAction>
            <div className="text-[10px] font-mono text-[var(--color-text-muted-value)] mb-2 flex items-center gap-1.5"><Clock size={12}/> 10:30 PM</div>
            <h3 className="font-semibold text-sm mb-1 text-[var(--color-text-base-value)]">Sleep Target</h3>
            <p className="text-xs text-[var(--color-text-muted-value)]">Goal: 8 Hours</p>
          </PremiumCard>
        </div>
      </section>

      {/* ─── 3. HEALTH SUMMARY ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] tracking-tight">Health Summary</h2>
          <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
            View Details <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Nutrition */}
          <PremiumCard className="flex flex-col h-full" hoverAction>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Flame size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Nutrition</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-1 mb-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-text-base-value)]">{todayStats?.calories || 0}</span>
                <span className="text-xs font-medium text-[var(--color-text-muted-value)] mb-1">/ {todayStats?.calorieGoal || 2500} kcal</span>
              </div>
              <AnimatedProgress progress={Math.min(100, ((todayStats?.calories || 0) / (todayStats?.calorieGoal || 2500)) * 100)} color="bg-orange-500" height={6} />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-wider mb-1">Protein</div>
                  <div className="font-mono text-sm font-semibold">{todayStats?.protein || 0}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-wider mb-1">Water</div>
                  <div className="font-mono text-sm font-semibold">{todayStats?.water || 0}L</div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Workout */}
          <PremiumCard className="flex flex-col h-full" hoverAction>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><Dumbbell size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Workout</span>
              </div>
              {todayStats?.hasWorkedOut && (
                <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Done</div>
              )}
            </div>
            <div className="mt-auto">
              <div className="mb-4">
                {todayStats?.hasWorkedOut ? (
                   <div className="font-heading text-xl font-bold text-[var(--color-text-base-value)]">Great job today!</div>
                ) : (
                   <div className="font-heading text-xl font-bold text-[var(--color-text-base-value)]">Time to train</div>
                )}
                <p className="text-xs text-[var(--color-text-muted-value)] mt-1">Consistency is key.</p>
              </div>
              <Link to="/workout" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] text-sm font-semibold hover:border-red-500/30 hover:bg-red-500/5 transition-all text-[var(--color-text-base-value)]">
                Open Planner
              </Link>
            </div>
          </PremiumCard>

          {/* Sleep */}
          <PremiumCard className="flex flex-col h-full" hoverAction>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Moon size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Sleep</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-1 mb-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-text-base-value)]">{todayStats?.sleepHours || '--'}</span>
                <span className="text-xs font-medium text-[var(--color-text-muted-value)] mb-1">hours</span>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-muted-value)]">{todayStats?.sleepHours ? getSleepLabel(todayStats.sleepHours) : 'Not logged yet'}</p>
            </div>
          </PremiumCard>

          {/* Weight */}
          <PremiumCard className="flex flex-col h-full" hoverAction>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Scale size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Weight</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-end gap-1 mb-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-text-base-value)]">{todayStats?.currentWeight || '--'}</span>
                <span className="text-xs font-medium text-[var(--color-text-muted-value)] mb-1">kg</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted-value)]">
                <Target size={12} /> Target: <span className="font-mono">{todayStats?.targetWeight || '--'}</span> kg
              </div>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* ─── 4. ACTION & MANAGEMENT ────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Finance */}
        <PremiumCard className="lg:col-span-1" hoverAction>
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Wallet size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Finance Overview</span>
              </div>
           </div>
           <div>
             <div className="text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-widest mb-1">Spent Today</div>
             <div className="font-mono text-3xl font-bold tracking-tight text-[var(--color-text-base-value)] mb-4">$45.00</div>
             <AnimatedProgress progress={35} color="bg-emerald-500" height={6} />
             <div className="flex justify-between text-[10px] text-[var(--color-text-muted-value)] font-semibold mt-2 uppercase tracking-wider">
               <span>Daily Budget</span>
               <span>35% Used</span>
             </div>
           </div>
        </PremiumCard>

        {/* Habits & Tasks */}
        <PremiumCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><CheckCircle2 size={16} /></div>
                <span className="font-semibold text-sm text-[var(--color-text-base-value)]">Habits & Tasks</span>
              </div>
              <Link to="/habits" className="text-[13px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                View All
              </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
             {habits?.slice(0, 4).map((habit: any) => (
                <div key={habit.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => completeHabit.mutate({ id: habit.id, completed: !habit.completed })}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all duration-300 ${habit.completed ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'border-[var(--color-border-subtle-value)] group-hover:border-blue-500/50'}`}>
                    {habit.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${habit.completed ? 'text-[var(--color-text-muted-value)] line-through' : 'text-[var(--color-text-base-value)] group-hover:text-blue-500'}`}>{habit.name}</p>
                  </div>
                </div>
             ))}
             {(!habits || habits.length === 0) && (
               <div className="col-span-full py-8 text-center text-[var(--color-text-muted-value)] text-sm">
                 <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] flex items-center justify-center mx-auto mb-3">
                   <Target size={20} className="opacity-50" />
                 </div>
                 No habits set for today.
               </div>
             )}
           </div>
        </PremiumCard>

      </section>

      {/* ─── 5. ACHIEVEMENTS (Optional Section) ────────────────────────── */}
      {recentAchievements?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] tracking-tight">Recent Achievements</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentAchievements?.map((ua: any) => (
              <PremiumCard key={ua.id} className="min-w-[140px] flex-shrink-0 !p-4 flex flex-col items-center justify-center text-center">
                <span className="text-4xl mb-3 drop-shadow-md">{ua.achievement.icon}</span>
                <p className="text-[11px] font-bold text-[var(--color-text-base-value)] leading-tight uppercase tracking-wide">
                  {ua.achievement.name}
                </p>
              </PremiumCard>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-12 pb-12">
      <div className="skeleton h-[340px] rounded-3xl" />
      <div className="skeleton h-8 w-48 rounded-md" />
      <div className="grid grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-3xl" />)}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getSleepLabel(hours: number) {
  if (hours >= 8) return 'Optimal Recovery'
  if (hours >= 7) return 'Good Quality'
  if (hours >= 6) return 'Slightly Deprived'
  return 'Action Needed'
}
