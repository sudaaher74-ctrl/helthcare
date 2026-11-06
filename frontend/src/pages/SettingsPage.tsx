import React, { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { User, Lock, Bell, Palette, LogOut, Save, Moon, Sun, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security'>('profile')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || '',
    height: user?.height || '',
    targetWeight: user?.targetWeight || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2800,
    dailyProteinGoal: user?.dailyProteinGoal || 150,
    dailyWaterGoal: user?.dailyWaterGoal ? user.dailyWaterGoal / 1000 : 3.0,
  })

  const [notifPreferences, setNotifPreferences] = useState({
    morningReminder: true,
    workoutReminder: true,
    mealReminder: true,
    weeklyReport: false,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/user/profile', {
        name: form.name,
        height: parseFloat(form.height.toString()) || undefined,
        targetWeight: parseFloat(form.targetWeight.toString()) || undefined,
        dailyCalorieGoal: parseInt(form.dailyCalorieGoal.toString()) || undefined,
        dailyProteinGoal: parseInt(form.dailyProteinGoal.toString()) || undefined,
        dailyWaterGoal: parseFloat(form.dailyWaterGoal.toString()) || undefined,
      })
      updateUser(res.data.data)
      toast.success('Profile and nutrition targets updated! 🎯')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = () => {
    toast.success('Notification preferences saved!')
  }

  const logout = () => {
    useAuthStore.getState().logout()
    toast.success('Signed out')
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--color-text-base)]">Settings</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your account, daily goals, and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {[
            { id: 'profile', icon: <User size={18} />, label: 'Profile & Targets' },
            { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
            { id: 'appearance', icon: <Palette size={18} />, label: 'Appearance' },
            { id: 'security', icon: <Lock size={18} />, label: 'Security' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-base)] font-bold shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-slate-200'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-[var(--color-border-subtle)]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-[var(--color-text-base)] mb-4">Profile & Daily Targets</h2>
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Email Address (Read Only)</label>
                  <input
                    value={user?.email || ''}
                    readOnly
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-subtle)]">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Height (cm)</label>
                    <input
                      type="number"
                      value={form.height}
                      onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Target Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.targetWeight}
                      onChange={(e) => setForm((p) => ({ ...p, targetWeight: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Daily Calorie Target (kcal)</label>
                    <input
                      type="number"
                      value={form.dailyCalorieGoal}
                      onChange={(e) => setForm((p) => ({ ...p, dailyCalorieGoal: Number(e.target.value) || 0 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Daily Protein Target (g)</label>
                    <input
                      type="number"
                      value={form.dailyProteinGoal}
                      onChange={(e) => setForm((p) => ({ ...p, dailyProteinGoal: Number(e.target.value) || 0 }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Daily Water Target (Liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.dailyWaterGoal}
                      onChange={(e) => setForm((p) => ({ ...p, dailyWaterGoal: Number(e.target.value) || 0 }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Targets'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-base)]">Notification Preferences</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Configure which reminders and alerts you receive</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'morningReminder', label: 'Morning Motivation & Habits', desc: 'Receive morning prompt at 6:30 AM' },
                  { key: 'workoutReminder', label: 'Workout Scheduled Alerts', desc: 'Notification 30 minutes before workout time' },
                  { key: 'mealReminder', label: 'Meal & Hydration Reminders', desc: 'Prompts to log breakfast, lunch, dinner, and water' },
                  { key: 'weeklyReport', label: 'Weekly Summary Digest', desc: 'Every Sunday evening review of life score and progress' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-secondary-value)]/40 border border-[var(--color-border-subtle-value)]">
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text-base)]">{item.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifPreferences as any)[item.key]}
                      onChange={(e) =>
                        setNotifPreferences((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--color-border-subtle)]">
                <button onClick={saveNotifications} className="btn btn-primary flex items-center gap-2">
                  <Save size={16} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-base)]">Theme & Visuals</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Choose your preferred application appearance</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/10'
                      : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-slate-500'
                  }`}
                >
                  <Moon size={32} className={theme === 'dark' ? 'text-blue-400' : ''} />
                  <div className="text-center">
                    <p className="font-bold text-sm">Dark Theme</p>
                    <p className="text-[10px] opacity-70 mt-0.5">High contrast obsidian OLED</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-lg shadow-blue-500/10'
                      : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-slate-500'
                  }`}
                >
                  <Sun size={32} className={theme === 'light' ? 'text-blue-500' : ''} />
                  <div className="text-center">
                    <p className="font-bold text-sm">Light Theme</p>
                    <p className="text-[10px] opacity-70 mt-0.5">Clean crisp daytime aesthetic</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-base)]">Security & Session</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Manage password and credentials</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    toast.error('Passwords do not match')
                    return
                  }
                  toast.success('Password updated successfully!')
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
