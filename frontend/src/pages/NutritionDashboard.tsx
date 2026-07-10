import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Camera, Upload, Trash2, Apple, Flame, ChevronDown, Bot, Check, Sparkles, X, Beef, Wheat, Droplets } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import api from '@/lib/api'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { MacroStatCard } from '@/components/ui/MacroStatCard'
import { WaterVisualizer } from '@/components/ui/WaterVisualizer'
import { AnimatedProgress } from '@/components/ui/AnimatedProgress'
import { cn } from '@/components/ui/PremiumCard'

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'PRE_WORKOUT', 'POST_WORKOUT']
const MEAL_META: Record<string, { icon: string; color: string; label: string }> = {
  BREAKFAST: { icon: '🌅', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', label: 'Breakfast' },
  LUNCH: { icon: '☀️', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', label: 'Lunch' },
  DINNER: { icon: '🌙', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', label: 'Dinner' },
  SNACKS: { icon: '🍎', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', label: 'Snacks' },
  PRE_WORKOUT: { icon: '⚡', color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Pre Workout' },
  POST_WORKOUT: { icon: '💪', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Post Workout' }
}

const COLORS = {
  Calories: '#F97316',
  Protein: '#10B981',
  Carbs: '#F59E0B',
  Fat: '#8B5CF6',
  Water: '#0EA5E9',
  AI: 'url(#aiGradient)'
}

// Mock data for charts since backend only returns daily
const mockWeeklyData = [
  { name: 'Mon', calories: 2400, protein: 140 },
  { name: 'Tue', calories: 2750, protein: 160 },
  { name: 'Wed', calories: 2600, protein: 155 },
  { name: 'Thu', calories: 2900, protein: 165 },
  { name: 'Fri', calories: 2500, protein: 145 },
  { name: 'Sat', calories: 3100, protein: 130 },
  { name: 'Sun', calories: 2800, protein: 150 },
]

export default function NutritionDashboard() {
  const qc = useQueryClient()
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['nutrition', date],
    queryFn: () => api.get(`/nutrition/meals?date=${date}`).then(r => r.data.data),
  })

  const { data: coach } = useQuery({
    queryKey: ['diet-coach'],
    queryFn: () => api.get('/nutrition/coach').then(r => r.data.data),
    staleTime: 1000 * 60 * 10,
  })

  const deleteMeal = useMutation({
    mutationFn: (id: string) => api.delete(`/nutrition/meals/${id}`),
    onSuccess: () => { toast.success('Meal deleted'); qc.invalidateQueries({ queryKey: ['nutrition'] }) },
  })

  const logWater = useMutation({
    mutationFn: (ml: number) => api.post('/nutrition/water', { amountML: ml, date }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutrition'] }),
  })

  const { totals, meals, waterML } = data || { totals: {}, meals: [], waterML: 0 }
  
  const dailyCalories = Math.round(totals?.calories || 0)
  const dailyProtein = Math.round(totals?.protein || 0)
  const dailyCarbs = Math.round(totals?.carbs || 0)
  const dailyFat = Math.round(totals?.fat || 0)

  // Goals
  const calorieGoal = 2800
  const proteinGoal = 160
  const carbsGoal = 300
  const fatGoal = 80
  const waterGoal = 3000

  const handleImageAnalyze = async (file: File) => {
    setAiLoading(true)
    setShowAI(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 800
          let { width, height } = img
          
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          const base64 = dataUrl.split(',')[1]
          
          try {
            const res = await api.post('/ai/analyze-food', { imageBase64: base64, mimeType: 'image/jpeg' })
            setAiResult(res.data.data)
            setAiLoading(false)
          } catch (err: any) {
            console.error('AI error:', err)
            toast.error(err.response?.data?.message || 'AI analysis failed')
            setAiLoading(false)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Could not process image')
      setAiLoading(false)
    }
  }

  const saveAiMeal = async () => {
    if (!aiResult) return
    try {
      await api.post('/nutrition/meals', {
        date, mealType: 'SNACKS', name: 'AI Analyzed Meal', analyzedByAI: true,
        foodEntries: aiResult.foods.map((f: any) => ({
          foodName: f.name, quantity: 1, servingSize: 100, calories: f.calories,
          protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber || 0, sugar: f.sugar || 0,
        })),
      })
      toast.success('Meal saved from AI analysis! 🤖', {
        icon: '🎉',
        style: { background: '#2563EB', color: '#fff', border: 'none' }
      })
      setShowAI(false)
      setAiResult(null)
      qc.invalidateQueries({ queryKey: ['nutrition'] })
    } catch { toast.error('Failed to save meal') }
  }

  const macroPieData = [
    { name: 'Protein', value: dailyProtein * 4, color: COLORS.Protein },
    { name: 'Carbs', value: dailyCarbs * 4, color: COLORS.Carbs },
    { name: 'Fat', value: dailyFat * 9, color: COLORS.Fat },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-12 pb-24">
      {/* ─── 1. PREMIUM HERO SECTION ───────────────────────────────────── */}
      <section>
        <PremiumCard className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#1e293b] border-none text-white !p-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 relative z-10">
            {/* Left: Greeting & AI Coach */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider mb-4 text-purple-200">
                  <Sparkles size={14} className="text-purple-400" /> AI Nutrition Coach
                </motion.div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  Good {getGreeting()},<br/>Ready to fuel up?
                </h1>
                
                {/* AI Advice Block */}
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed mb-4">
                    {coach?.recommendations?.[0] || `You need ${Math.max(0, proteinGoal - dailyProtein)}g more protein today to hit your target. Try adding eggs or chicken to your next meal.`}
                  </p>
                  <div className="flex gap-3">
                    <PremiumButton variant="ai" onClick={() => setShowAI(true)}>
                      <Camera size={16} /> Scan Meal
                    </PremiumButton>
                    <PremiumButton variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none" onClick={() => setShowAddMeal(true)}>
                      <Plus size={16} /> Manual Log
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Nutrition Score & Calories */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-orange-500 blur-[80px] rounded-full opacity-20"></div>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center shadow-2xl relative">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Calories Remaining</h3>
                  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                      <motion.circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke="#F97316" strokeWidth="8" strokeLinecap="round"
                        initial={{ strokeDasharray: "0 283" }}
                        animate={{ strokeDasharray: `${Math.min((dailyCalories / calorieGoal) * 283, 283)} 283` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-heading text-5xl font-bold text-white tracking-tighter">
                        {Math.max(0, calorieGoal - dailyCalories)}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1">kcal</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between text-xs font-medium text-slate-300">
                    <div className="text-left">
                      <div className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Eaten</div>
                      <div className="text-white font-mono text-sm">{dailyCalories}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Target</div>
                      <div className="text-white font-mono text-sm">{calorieGoal}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </section>

      {/* ─── 2. TOP CARDS (MACROS & WATER) ──────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] tracking-tight">Today's Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MacroStatCard 
            label="Protein" current={dailyProtein} goal={proteinGoal} unit="g" 
            color={COLORS.Protein} icon={<Beef size={16} />} trend="+15g from avg"
          />
          <MacroStatCard 
            label="Carbs" current={dailyCarbs} goal={carbsGoal} unit="g" 
            color={COLORS.Carbs} icon={<Wheat size={16} />} 
          />
          <MacroStatCard 
            label="Fat" current={dailyFat} goal={fatGoal} unit="g" 
            color={COLORS.Fat} icon={<Flame size={16} />}
          />
          <div className="lg:col-span-1 md:col-span-2">
             <WaterVisualizer currentML={waterML || 0} goalML={waterGoal} onAddWater={(ml) => logWater.mutate(ml)} />
          </div>
        </div>
      </section>

      {/* ─── 3. MEAL TIMELINE & CHARTS ──────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Meal Log Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] tracking-tight">Meal Timeline</h2>
            <PremiumButton variant="primary" size="sm" onClick={() => setShowAddMeal(true)}>
              <Plus size={14} /> Add Meal
            </PremiumButton>
          </div>

          <PremiumCard className="!p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-4">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            ) : meals?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-24 h-24 bg-[var(--color-bg-secondary-value)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Apple size={40} className="text-slate-400" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-base-value)] mb-2">Start building healthy eating habits</h3>
                <p className="text-sm text-[var(--color-text-muted-value)] max-w-sm mx-auto mb-8">
                  Log your first meal today to track your macros, get AI insights, and hit your fitness goals faster.
                </p>
                <PremiumButton variant="primary" size="lg" onClick={() => setShowAddMeal(true)}>
                  Log First Meal
                </PremiumButton>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-subtle-value)]">
                {meals.map((meal: any) => {
                  const meta = MEAL_META[meal.mealType] || MEAL_META.SNACKS
                  return (
                    <motion.div 
                      key={meal.id} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="p-6 hover:bg-[var(--color-bg-secondary-value)]/30 transition-colors flex items-start gap-4 sm:gap-6 group"
                    >
                      {/* Timeline Icon */}
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border shadow-sm", meta.color)}>
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold text-base text-[var(--color-text-base-value)] truncate">
                              {meal.name || meta.label}
                            </h4>
                            <p className="text-xs font-medium text-[var(--color-text-muted-value)]">
                              {meal.foodEntries?.length || 0} items
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-lg font-bold tracking-tight text-[var(--color-text-base-value)]">
                              {Math.round(meal.totalCalories)}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted-value)] font-bold ml-1 uppercase">kcal</span>
                          </div>
                        </div>

                        {/* Macro Pills */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            {Math.round(meal.totalProtein)}g Protein
                          </div>
                          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            {Math.round(meal.totalCarbs)}g Carbs
                          </div>
                          <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            {Math.round(meal.totalFat)}g Fat
                          </div>
                        </div>
                      </div>

                      {/* Delete Button (Visible on hover) */}
                      <button 
                        onClick={() => deleteMeal.mutate(meal.id)} 
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0 ml-2"
                        title="Delete Meal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Charts Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <PremiumCard>
            <h3 className="font-semibold text-sm text-[var(--color-text-base-value)] mb-6">Macro Split</h3>
            {macroPieData.length > 0 ? (
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macroPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {macroPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold font-mono">{dailyCalories}</span>
                  <span className="text-[10px] text-[var(--color-text-muted-value)] uppercase tracking-wider font-bold">kcal</span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[var(--color-text-muted-value)] text-sm">No macros recorded</div>
            )}
            <div className="flex justify-center gap-4 mt-4">
               {macroPieData.map(d => (
                 <div key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted-value)]">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                   {d.name}
                 </div>
               ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <h3 className="font-semibold text-sm text-[var(--color-text-base-value)] mb-6">Weekly Calories (Mock)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted-value)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted-value)' }} />
                  <Tooltip cursor={{ fill: 'var(--color-bg-tertiary-value)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="calories" fill={COLORS.Calories} radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* ─── MODALS ────────────────────────────────────────────────────── */}
      
      {/* AI Food Analyzer Modal */}
      <AnimatePresence>
        {showAI && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !aiLoading && setShowAI(false)} />
            
            <motion.div 
              initial={{opacity:0, scale:0.95, y: 20}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0, scale:0.95, y: 20}}
              className="relative w-full max-w-lg bg-[var(--color-bg-primary-value)] rounded-[32px] shadow-2xl border border-[var(--color-border-subtle-value)] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-[var(--color-text-base-value)] flex items-center gap-2">
                      <Sparkles className="text-purple-500" /> AI Food Analyzer
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted-value)] mt-1">Snap a photo and we'll calculate the macros.</p>
                  </div>
                  <button onClick={() => !aiLoading && setShowAI(false)} className="p-2 bg-[var(--color-bg-secondary-value)] rounded-full hover:bg-[var(--color-bg-tertiary-value)] text-[var(--color-text-muted-value)]">
                    <X size={20} />
                  </button>
                </div>

                {!aiResult ? (
                  <div
                    className={cn(
                      "w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer bg-gradient-to-br from-purple-500/5 to-blue-500/5 relative overflow-hidden",
                      dragOver ? "border-purple-500 bg-purple-500/10 scale-[0.98]" : "border-[var(--color-border-subtle-value)] hover:border-purple-400/50 hover:bg-purple-500/10"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if(file) handleImageAnalyze(file) }}
                    onClick={() => document.getElementById('food-upload-premium')?.click()}
                  >
                    {aiLoading ? (
                      <div className="flex flex-col items-center z-10">
                        {/* Scanline Animation */}
                        <motion.div 
                          className="absolute top-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_20px_4px_rgba(168,85,247,0.5)] z-0"
                          animate={{ y: ['0%', '400%', '0%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 relative z-10">
                          <Bot size={32} className="text-purple-500 animate-pulse" />
                        </div>
                        <p className="font-semibold text-[var(--color-text-base-value)]">Analyzing Image...</p>
                        <p className="text-xs text-[var(--color-text-muted-value)] mt-1">Identifying food items & portions</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center z-10 text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] shadow-sm flex items-center justify-center mb-4 text-purple-500">
                          <Camera size={28} />
                        </div>
                        <p className="font-bold text-[var(--color-text-base-value)] text-lg mb-1">Upload Photo</p>
                        <p className="text-sm text-[var(--color-text-muted-value)] font-medium mb-6">Drag & drop or click to browse</p>
                        <PremiumButton variant="ai" size="sm" className="pointer-events-none">
                          Choose File
                        </PremiumButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Check size={14} /> Analysis Complete
                      </p>
                      <p className="text-sm text-[var(--color-text-base-value)] font-medium">
                        Found {aiResult.foods?.length} item(s). {aiResult.analysisNotes}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[['Calories','totalCalories','kcal', COLORS.Calories],['Protein','totalProtein','g', COLORS.Protein],['Carbs','totalCarbs','g', COLORS.Carbs],['Fat','totalFat','g', COLORS.Fat]].map(([l,k,u,c]) => (
                        <div key={l} className="bg-[var(--color-bg-secondary-value)] p-4 rounded-2xl border border-[var(--color-border-subtle-value)] flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted-value)] mb-1">{l}</p>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-bold font-mono" style={{ color: c as string }}>
                              {Math.round(aiResult[k as string])}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--color-text-muted-value)]">{u}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <PremiumButton variant="cancel" size="lg" className="flex-1" onClick={() => setAiResult(null)}>
                        Discard
                      </PremiumButton>
                      <PremiumButton variant="primary" size="lg" className="flex-1 shadow-lg shadow-blue-500/30" onClick={saveAiMeal}>
                        Save Meal
                      </PremiumButton>
                    </div>
                  </motion.div>
                )}

                <input id="food-upload-premium" type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if(f) handleImageAnalyze(f) }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Meal Manual Modal */}
      <AnimatePresence>
        {showAddMeal && (
          <AddMealModal
            date={date}
            onClose={() => setShowAddMeal(false)}
            onSave={() => { setShowAddMeal(false); qc.invalidateQueries({ queryKey: ['nutrition'] }) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddMealModal({ date, onClose, onSave }: any) {
  const [mealType, setMealType] = useState('BREAKFAST')
  const [foods, setFoods] = useState([{ foodName: '', quantity: 1, servingSize: 100, calories: 0, protein: 0, carbs: 0, fat: 0 }])
  const [saving, setSaving] = useState(false)

  const addFood = () => setFoods(p => [...p, { foodName: '', quantity: 1, servingSize: 100, calories: 0, protein: 0, carbs: 0, fat: 0 }])
  const updateFood = (i: number, key: string, val: any) => setFoods(p => p.map((f,idx) => idx === i ? {...f, [key]: val} : f))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/nutrition/meals', { date, mealType, foodEntries: foods })
      toast.success('Meal logged successfully! 🥗', { style: { background: '#10B981', color: '#fff', border: 'none' } })
      onSave()
    } catch { toast.error('Failed to log meal') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose()} />
      <motion.div 
        initial={{opacity:0, scale:0.95, y: 20}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0, scale:0.95, y: 20}}
        className="relative w-full max-w-2xl bg-[var(--color-bg-primary-value)] rounded-[32px] shadow-2xl border border-[var(--color-border-subtle-value)] max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-[var(--color-border-subtle-value)] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-heading font-bold text-[var(--color-text-base-value)]">Log Meal</h3>
            <p className="text-sm text-[var(--color-text-muted-value)] mt-1">Enter your food details manually.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-[var(--color-bg-secondary-value)] rounded-full hover:bg-[var(--color-bg-tertiary-value)] text-[var(--color-text-muted-value)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form id="manual-meal-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Meal Type Selectors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted-value)] mb-3">When did you eat?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MEAL_TYPES.map(t => {
                  const meta = MEAL_META[t] || MEAL_META.SNACKS
                  const isActive = mealType === t
                  return (
                    <button 
                      key={t} type="button" onClick={() => setMealType(t)}
                      className={cn(
                        "py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2",
                        isActive 
                          ? cn(meta.color, "border-transparent shadow-md scale-[1.02]") 
                          : "border-[var(--color-border-subtle-value)] text-[var(--color-text-muted-value)] bg-[var(--color-bg-secondary-value)] hover:bg-[var(--color-bg-tertiary-value)]"
                      )}>
                      <span className="text-lg">{meta.icon}</span> {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Food Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted-value)]">Food Items</label>
                <button type="button" onClick={addFood} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {foods.map((f, i) => (
                  <div key={i} className="p-5 bg-[var(--color-bg-secondary-value)] border border-[var(--color-border-subtle-value)] rounded-2xl relative group">
                    {foods.length > 1 && (
                      <button type="button" onClick={() => setFoods(p => p.filter((_,idx) => idx !== i))} className="absolute -top-3 -right-3 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted-value)] mb-1.5 ml-1">Food Name</label>
                      <input value={f.foodName} onChange={e => updateFood(i, 'foodName', e.target.value)}
                        placeholder="e.g. Grilled Chicken Breast" 
                        className="w-full bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-base-value)] placeholder:text-[var(--color-text-muted-value)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" required 
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Calories', key: 'calories', color: 'focus:ring-orange-500/50 focus:border-orange-500' },
                        { label: 'Protein', key: 'protein', color: 'focus:ring-emerald-500/50 focus:border-emerald-500' },
                        { label: 'Carbs', key: 'carbs', color: 'focus:ring-amber-500/50 focus:border-amber-500' },
                        { label: 'Fat', key: 'fat', color: 'focus:ring-purple-500/50 focus:border-purple-500' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted-value)] mb-1.5 ml-1">{field.label}</label>
                          <input type="number" value={(f as any)[field.key] || ''} onChange={e => updateFood(i, field.key, +e.target.value)} 
                            className={cn("w-full bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-base-value)] font-mono focus:outline-none focus:ring-2 transition-all", field.color)} 
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 md:p-8 border-t border-[var(--color-border-subtle-value)] bg-[var(--color-bg-secondary-value)] shrink-0 flex gap-3">
          <PremiumButton variant="cancel" size="lg" className="flex-1" onClick={onClose}>Cancel</PremiumButton>
          <PremiumButton variant="primary" size="lg" className="flex-1 shadow-lg shadow-blue-500/30" form="manual-meal-form" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Log Meal'}
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
