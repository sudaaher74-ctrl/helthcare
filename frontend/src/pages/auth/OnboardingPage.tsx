import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, User, Scale, Target, Activity, Zap, Check } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const STEPS = ['Profile', 'Body Stats', 'Goals', 'Activity', 'Done']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    height: '',
    currentWeight: '46',
    targetWeight: '55',
    activityLevel: 'MODERATE',
    dailyCalorieGoal: '2800',
    dailyProteinGoal: '150',
  })

  const update = (key: string, value: string) => setFormData((p) => ({ ...p, [key]: value }))

  const handleComplete = async () => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        dailyCalorieGoal: parseInt(formData.dailyCalorieGoal),
        dailyProteinGoal: parseInt(formData.dailyProteinGoal),
      }
      const res = await api.post('/user/onboarding', payload)
      updateUser({ ...res.data.data })
      toast.success('Setup complete! Welcome to LifeOS 🚀')
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    // Step 0 — Profile
    <div key="0" className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👤</div>
        <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
        <p className="text-slate-400 text-sm mt-1">We'll personalize your experience</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
        <input value={formData.name} onChange={(e) => update('name', e.target.value)}
          placeholder="Enter your name" className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Age</label>
        <input value={formData.age} onChange={(e) => update('age', e.target.value)}
          type="number" placeholder="e.g. 22" className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
        <div className="grid grid-cols-3 gap-2">
          {['MALE', 'FEMALE', 'OTHER'].map((g) => (
            <button key={g} type="button"
              onClick={() => update('gender', g)}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                formData.gender === g
                  ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                  : 'border-white/10 text-slate-400 hover:border-white/20'
              }`}>
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1 — Body Stats
    <div key="1" className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚖️</div>
        <h2 className="text-2xl font-bold text-white">Body Stats</h2>
        <p className="text-slate-400 text-sm mt-1">Help us calculate your needs</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Height (cm)</label>
        <input value={formData.height} onChange={(e) => update('height', e.target.value)}
          type="number" placeholder="e.g. 170" className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Weight (kg)</label>
        <input value={formData.currentWeight} onChange={(e) => update('currentWeight', e.target.value)}
          type="number" step="0.1" className="input-field" />
      </div>
      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <p className="text-violet-300 text-sm">
          💪 Your starting weight: <strong>{formData.currentWeight} kg</strong>
        </p>
      </div>
    </div>,

    // Step 2 — Goals
    <div key="2" className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎯</div>
        <h2 className="text-2xl font-bold text-white">Your Goals</h2>
        <p className="text-slate-400 text-sm mt-1">What do you want to achieve?</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Weight (kg)</label>
        <input value={formData.targetWeight} onChange={(e) => update('targetWeight', e.target.value)}
          type="number" step="0.1" className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Daily Calorie Goal (kcal)</label>
        <input value={formData.dailyCalorieGoal} onChange={(e) => update('dailyCalorieGoal', e.target.value)}
          type="number" className="input-field" />
        <p className="text-xs text-slate-500 mt-1">Recommended for weight gain: 2800-3200 kcal</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Daily Protein Goal (g)</label>
        <input value={formData.dailyProteinGoal} onChange={(e) => update('dailyProteinGoal', e.target.value)}
          type="number" className="input-field" />
        <p className="text-xs text-slate-500 mt-1">Recommended for muscle gain: 130-160g</p>
      </div>
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-emerald-300 text-sm">
          📈 Goal: <strong>{formData.currentWeight}kg → {formData.targetWeight}kg</strong>
          {' '}({parseFloat(formData.targetWeight) > parseFloat(formData.currentWeight)
            ? `+${(parseFloat(formData.targetWeight) - parseFloat(formData.currentWeight)).toFixed(1)}kg to gain`
            : 'maintenance'})
        </p>
      </div>
    </div>,

    // Step 3 — Activity
    <div key="3" className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🏃</div>
        <h2 className="text-2xl font-bold text-white">Activity Level</h2>
        <p className="text-slate-400 text-sm mt-1">How active are you currently?</p>
      </div>
      {[
        { value: 'SEDENTARY', label: 'Sedentary', desc: 'Little or no exercise', icon: '🛋️' },
        { value: 'LIGHT', label: 'Light', desc: '1-3 days/week exercise', icon: '🚶' },
        { value: 'MODERATE', label: 'Moderate', desc: '3-5 days/week exercise', icon: '🏃' },
        { value: 'ACTIVE', label: 'Active', desc: '6-7 days/week exercise', icon: '💪' },
        { value: 'VERY_ACTIVE', label: 'Very Active', desc: 'Athlete / 2x daily training', icon: '🏆' },
      ].map((a) => (
        <button key={a.value} type="button" onClick={() => update('activityLevel', a.value)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
            formData.activityLevel === a.value
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-white/8 hover:border-white/16 bg-white/3'
          }`}>
          <span className="text-2xl">{a.icon}</span>
          <div>
            <p className={`font-semibold text-sm ${formData.activityLevel === a.value ? 'text-violet-300' : 'text-slate-200'}`}>
              {a.label}
            </p>
            <p className="text-xs text-slate-500">{a.desc}</p>
          </div>
          {formData.activityLevel === a.value && (
            <Check size={16} className="ml-auto text-violet-400 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>,

    // Step 4 — Done
    <div key="4" className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-violet mx-auto"
      >
        <Zap size={40} className="text-white" />
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-white">You're all set!</h2>
        <p className="text-slate-400 mt-2">Your personalized Life OS is ready</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-left">
        {[
          { label: 'Daily Calories', value: `${formData.dailyCalorieGoal} kcal`, icon: '🔥' },
          { label: 'Protein Goal', value: `${formData.dailyProteinGoal}g`, icon: '💪' },
          { label: 'Weight Goal', value: `${formData.currentWeight} → ${formData.targetWeight}kg`, icon: '📈' },
          { label: 'Default Habits', value: '14 habits ready', icon: '✅' },
        ].map((item) => (
          <div key={item.label} className="glass-card p-3">
            <span className="text-lg">{item.icon}</span>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
            <p className="text-sm font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold gradient-text-violet">LifeOS Setup</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'gradient-violet' : 'bg-white/10'
              }`} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>

        {/* Step Content */}
        <div className="glass-card p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn btn-secondary flex-1">
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary flex-1">
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="btn btn-primary flex-1 btn-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : (
                <>
                  <Zap size={18} />
                  Launch LifeOS
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
