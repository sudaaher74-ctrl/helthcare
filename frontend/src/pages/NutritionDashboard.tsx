import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Camera, Upload, Trash2, Apple, Droplets, ChevronDown, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'

const MEAL_TYPES = ['BREAKFAST','LUNCH','DINNER','SNACKS','PRE_WORKOUT','POST_WORKOUT']
const MEAL_ICONS: Record<string,string> = {
  BREAKFAST:'🌅',LUNCH:'☀️',DINNER:'🌙',SNACKS:'🍎',PRE_WORKOUT:'⚡',POST_WORKOUT:'💪'
}

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
  const calorieGoal = 2800

  const macros = [
    { label: 'Protein', current: Math.round(totals?.protein||0), goal: 150, unit: 'g', color: '#06b6d4', bg: 'from-[var(--color-text-base)] to-[var(--color-text-muted)]' },
    { label: 'Carbs', current: Math.round(totals?.carbs||0), goal: 350, unit: 'g', color: '#10b981', bg: 'from-[var(--color-text-base)] to-green-500' },
    { label: 'Fat', current: Math.round(totals?.fat||0), goal: 80, unit: 'g', color: '#a78bfa', bg: 'from-[var(--color-text-base)] to-purple-500' },
  ]

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
      toast.success('Meal saved from AI analysis! 🤖')
      setShowAI(false)
      setAiResult(null)
      qc.invalidateQueries({ queryKey: ['nutrition'] })
    } catch { toast.error('Failed to save meal') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Nutrition</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAI(true)} className="btn btn-secondary btn-sm">
            <Camera size={15} /> AI Scan
          </button>
          <button onClick={() => setShowAddMeal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Log Meal
          </button>
        </div>
      </div>

      {/* Main Calorie Ring & Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-surface)] blur-3xl rounded-full scale-150" />
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-6 z-10">Calories Today</h2>
          <div className="relative w-48 h-48 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke="url(#calorieGradient)" strokeWidth="8" strokeLinecap="round"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${Math.min((dailyCalories/calorieGoal)*283, 283)} 283` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.4))' }}
              />
              <defs>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-[var(--color-text-base)] drop-shadow-lg">{dailyCalories}</span>
              <span className="text-xs text-[var(--color-text-muted)] font-bold mt-1">/ {calorieGoal} kcal</span>
            </div>
          </div>
          <div className="mt-6 w-full max-w-xs space-y-4 relative z-10">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)] font-semibold">{m.label}</span>
                  <span className="text-slate-300">{m.current} / {m.goal}{m.unit}</span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div className={`progress-bar-fill bg-gradient-to-r ${m.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, m.goal ? (m.current / m.goal) * 100 : 0)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Water + AI Coach Container */}
        <div className="flex flex-col gap-6">
        {/* Water */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-[var(--color-text-base)] flex items-center gap-2 mb-3">
            <Droplets size={16} className="text-[var(--color-text-muted)]" /> Water Intake
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-3xl font-extrabold text-[var(--color-text-muted)]">
              {((waterML || 0) / 1000).toFixed(1)}L
            </div>
            <div className="flex-1">
              <div className="progress-bar h-2">
                <motion.div className="progress-bar-fill from-[var(--color-text-base)] to-[var(--color-text-muted)] bg-gradient-to-r"
                  animate={{ width: `${Math.min(100, (waterML / 1000 / 3) * 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">of 3L goal</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map(ml => (
              <button key={ml} onClick={() => logWater.mutate(ml)} className="btn btn-secondary btn-sm text-xs">
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* AI Diet Coach */}
        {coach && (
          <div className="glass-card p-5">
            <h3 className="font-semibold text-[var(--color-text-base)] flex items-center gap-2 mb-3">
              <Bot size={16} className="text-[var(--color-text-muted)]" /> AI Diet Coach
              <span className="badge badge-violet ml-auto">Score: {coach.nutritionScore}</span>
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {coach.recommendations?.slice(0,3).map((r: string, i: number) => (
                <p key={i} className="text-xs text-slate-300 bg-white/3 rounded-lg p-2.5">{r}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Meal Log */}
      <div>
        <h2 className="font-bold text-[var(--color-text-base)] mb-3">Meal Log</h2>
        {isLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : meals?.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Apple size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-[var(--color-text-muted)]">No meals logged today</p>
            <button onClick={() => setShowAddMeal(true)} className="btn btn-primary btn-sm mt-3">
              <Plus size={14} /> Log First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal: any) => (
              <div key={meal.id} className="glass-card p-4 glass-card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{MEAL_ICONS[meal.mealType] || '🍽️'}</span>
                    <div>
                      <p className="font-medium text-[var(--color-text-base)] text-sm">
                        {meal.name || meal.mealType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {meal.foodEntries?.length || 0} items · {Math.round(meal.totalCalories)} kcal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <span className="text-[var(--color-text-muted)] font-semibold">{Math.round(meal.totalProtein)}g P</span>
                      <span className="text-[var(--color-text-muted)] mx-1">·</span>
                      <span className="text-[var(--color-text-muted)] font-semibold">{Math.round(meal.totalCarbs)}g C</span>
                    </div>
                    <button onClick={() => deleteMeal.mutate(meal.id)} className="btn btn-ghost btn-icon text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Food Analyzer Modal */}
      <AnimatePresence>
        {showAI && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAI(false)}>
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="modal-content">
              <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-2">🤖 AI Food Analyzer</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">Upload a photo of your meal and AI will estimate the nutrition</p>

              {!aiResult && (
                <div
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if(file) handleImageAnalyze(file) }}
                  onClick={() => document.getElementById('food-upload')?.click()}
                >
                  {aiLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-[var(--color-border-subtle)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[var(--color-text-muted)] text-sm">Analyzing your food...</p>
                      <p className="text-slate-600 text-xs">AI is estimating nutrition</p>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} className="text-[var(--color-text-muted)] mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">Drop food photo here</p>
                      <p className="text-[var(--color-text-muted)] text-sm mt-1">or click to upload</p>
                    </>
                  )}
                </div>
              )}

              <input id="food-upload" type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if(f) handleImageAnalyze(f) }}
              />

              {aiResult && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">🤖 AI detected {aiResult.foods?.length} food item(s)</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{aiResult.analysisNotes}</p>
                  </div>
                  {aiResult.foods?.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-base)]">{f.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{f.portionSize}</p>
                      </div>
                      <div className="text-right text-xs space-y-0.5">
                        <p className="text-[var(--color-text-muted)] font-bold">{f.calories} kcal</p>
                        <p className="text-[var(--color-text-muted)]">{f.protein}g protein</p>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 gap-2 p-3 bg-white/3 rounded-xl">
                    {[['Calories','totalCalories','kcal','text-[var(--color-text-muted)]'],['Protein','totalProtein','g','text-[var(--color-text-muted)]'],['Carbs','totalCarbs','g','text-[var(--color-text-muted)]'],['Fat','totalFat','g','text-[var(--color-text-muted)]']].map(([l,k,u,c]) => (
                      <div key={l} className="text-center">
                        <p className={`text-sm font-bold ${c}`}>{Math.round(aiResult[k as string])}{u}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAiResult(null) }} className="btn btn-secondary flex-1">Retry</button>
                    <button onClick={saveAiMeal} className="btn btn-primary flex-1">Save Meal ✓</button>
                  </div>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <button onClick={() => setShowAI(false)} className="btn btn-secondary w-full mt-3">Cancel</button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Meal Modal */}
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
      toast.success('Meal logged! 🥗')
      onSave()
    } catch { toast.error('Failed to log meal') } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="modal-content max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4">Log Meal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Meal Type</label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setMealType(t)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-all ${mealType === t ? 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)]' : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'}`}>
                  {MEAL_ICONS[t]} {t.replace('_',' ').toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Food Items</label>
            {foods.map((f, i) => (
              <div key={i} className="p-3 bg-white/3 rounded-xl mb-2 space-y-2">
                <input value={f.foodName} onChange={e => updateFood(i, 'foodName', e.target.value)}
                  placeholder="Food name (e.g. Chicken Breast)" className="input-field text-sm" required />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)]">Calories (kcal)</label>
                    <input type="number" value={f.calories} onChange={e => updateFood(i, 'calories', +e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)]">Protein (g)</label>
                    <input type="number" value={f.protein} onChange={e => updateFood(i, 'protein', +e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)]">Carbs (g)</label>
                    <input type="number" value={f.carbs} onChange={e => updateFood(i, 'carbs', +e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)]">Fat (g)</label>
                    <input type="number" value={f.fat} onChange={e => updateFood(i, 'fat', +e.target.value)} className="input-field text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addFood} className="btn btn-secondary btn-sm w-full">
              <Plus size={14} /> Add Another Food
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : 'Log Meal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
