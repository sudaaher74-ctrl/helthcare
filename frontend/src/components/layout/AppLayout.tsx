import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Target, Apple, Dumbbell, Moon, Scale,
  Trophy, CheckSquare, Calendar, BarChart2, Award, Settings,
  Zap, Menu, X, PlusCircle, User, Sun, Wallet
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: Target, label: 'Habits' },
  { to: '/nutrition', icon: Apple, label: 'Nutrition' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/sleep', icon: Moon, label: 'Sleep' },
  { to: '/weight', icon: Scale, label: 'Weight' },
  { to: '/goals', icon: Trophy, label: 'Goals' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/achievements', icon: Award, label: 'Achievements' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/goals', icon: Trophy, label: 'Goals' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '#', icon: PlusCircle, label: 'Log', action: 'log' },
  { to: '/analytics', icon: BarChart2, label: 'Insights' },
  { to: '/settings', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-[var(--color-text-base)]" />
          </div>
          <div>
            <span className="font-bold text-base gradient-text-violet">LifeOS</span>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-none mt-0.5">Life Operating System</p>
          </div>
        </div>

        {/* User summary */}
        {user && (
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-violet flex items-center justify-center text-sm font-bold text-[var(--color-text-base)] flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-base)] truncate">{user.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                  {user.currentWeight}kg → {user.targetWeight}kg
                </p>
              </div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1">Core</p>
            {navItems.slice(0, 6).map((item) => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1">Productivity</p>
            {navItems.slice(6, 9).map((item) => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1">Insights</p>
            {navItems.slice(9).map((item) => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </div>
        </nav>

        {/* Weight progress indicator */}
        {user?.currentWeight && user?.targetWeight && (
          <div className="p-4 border-t border-[var(--color-border-subtle)]">
            <div className="glass-card p-3">
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                <span>Weight Goal</span>
                <span className="text-[var(--color-text-muted)] font-semibold">
                  {Math.max(0, user.targetWeight - user.currentWeight).toFixed(1)}kg left
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill gradient-violet"
                  style={{
                    width: `${Math.min(100, (user.currentWeight / user.targetWeight) * 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5">
                <span>{user.currentWeight}kg</span>
                <span>{user.targetWeight}kg</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="absolute inset-0 bg-[var(--color-bg-primary)]/60" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 h-full w-64 bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-violet flex items-center justify-center">
                  <Zap size={14} className="text-[var(--color-text-base)]" />
                </div>
                <span className="font-bold gradient-text-violet">LifeOS</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost btn btn-icon">
                <X size={18} />
              </button>
            </div>
            <nav className="px-3 pb-6">
              {navItems.map((item) => (
                <SidebarItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
              ))}
            </nav>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content flex-1 ml-[240px] min-h-screen bg-[var(--color-bg-primary)]">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--color-border-subtle)]">
          <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-icon">
            <Menu size={20} className="text-[var(--color-text-base)]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-violet flex items-center justify-center">
              <Zap size={12} className="text-[var(--color-text-base)]" />
            </div>
            <span className="font-bold text-sm gradient-text-violet">LifeOS</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full gradient-violet flex items-center justify-center text-xs font-bold text-[var(--color-text-base)]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        {mobileNav.map((item) => (
          item.action ? (
            <button
              key={item.label}
              onClick={() => {
                // To be implemented: Open global log modal
                console.log('Open log modal');
              }}
              className="bottom-nav-item flex items-center justify-center -mt-6"
            >
              <div className="bg-[var(--color-text-base)] text-[var(--color-bg-primary)] rounded-full p-3 shadow-lg shadow-md">
                <item.icon size={28} className="text-[var(--color-text-base)]" />
              </div>
              <span className="mt-1">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        ))}
      </nav>
    </div>
  )
}

function SidebarItem({
  to, icon: Icon, label, onClick
}: { to: string; icon: any; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? 'active' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
