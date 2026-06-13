import React, { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { User, Lock, Bell, Palette, LogOut, Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    name: user?.name || '',
    height: user?.height || '',
    targetWeight: user?.targetWeight || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || ''
  })

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/user/profile', {
        name: form.name,
        height: parseFloat(form.height.toString()) || undefined,
        targetWeight: parseFloat(form.targetWeight.toString()) || undefined,
        dailyCalorieGoal: parseInt(form.dailyCalorieGoal.toString()) || undefined
      })
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const logout = () => {
    useAuthStore.getState().logout()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {[
            { icon: <User size={18}/>, label: 'Profile', active: true },
            { icon: <Bell size={18}/>, label: 'Notifications', active: false },
            { icon: <Palette size={18}/>, label: 'Appearance', active: false },
            { icon: <Lock size={18}/>, label: 'Security', active: false },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-base)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-slate-200'}`}>
              {item.icon} {item.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-[var(--color-border-subtle)]">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-all">
              <LogOut size={18}/> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[var(--color-text-base)] mb-4">Profile Settings</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Email Address (Read Only)</label>
                <input value={user?.email || ''} readOnly className="input-field opacity-50 cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-subtle)]">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Height (cm)</label>
                  <input type="number" value={form.height} onChange={e=>setForm(p=>({...p,height:e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Target Weight (kg)</label>
                  <input type="number" value={form.targetWeight} onChange={e=>setForm(p=>({...p,targetWeight:e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Daily Calorie Goal</label>
                  <input type="number" value={form.dailyCalorieGoal} onChange={e=>setForm(p=>({...p,dailyCalorieGoal:e.target.value}))} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                  <Save size={16}/> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
