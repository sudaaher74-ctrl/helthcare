import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Target, Apple, Dumbbell, Moon, Scale,
  Trophy, CheckSquare, Calendar, BarChart2, Award, Settings,
  Zap, Menu, X, PlusCircle, User, Sun, Wallet, Flame, Command, Search
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: Target, label: 'Habits' },
  { to: '/nutrition', icon: Apple, label: 'Nutrition' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/gym', icon: Flame, label: 'Gym Planner' },
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
  { to: '/analytics', icon: BarChart2, label: 'Insights' },
  { to: '/settings', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary-value)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 premium-glass border-r border-[var(--color-border-subtle-value)] z-50">
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-[var(--color-text-base-value)] leading-none tracking-tight">LifeOS</h1>
            <p className="text-[11px] font-medium text-[var(--color-text-muted-value)] mt-1">Premium Edition</p>
          </div>
        </div>

        {/* Global Search Hint */}
        <div className="px-6 mb-4">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-bg-secondary-value)] border border-[var(--color-border-subtle-value)] text-[var(--color-text-muted-value)] hover:text-[var(--color-text-base-value)] hover:border-[var(--color-text-muted-value)] transition-colors text-sm">
            <Search size={14} />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-0.5 text-[10px] font-mono font-medium">
              <Command size={10} /> K
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 scrollbar-hide">
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-widest font-heading">Core</p>
            <div className="space-y-0.5">
              {navItems.slice(0, 7).map((item) => (
                <SidebarItem key={item.to} {...item} />
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-widest font-heading">Productivity</p>
            <div className="space-y-0.5">
              {navItems.slice(7, 10).map((item) => (
                <SidebarItem key={item.to} {...item} />
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-widest font-heading">Insights</p>
            <div className="space-y-0.5">
              {navItems.slice(10).map((item) => (
                <SidebarItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="p-4 border-t border-[var(--color-border-subtle-value)] bg-[var(--color-bg-secondary-value)]/30 m-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 flex-shrink-0 shadow-sm border border-white/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-base-value)] truncate">{user.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted-value)] truncate">Pro Plan</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-[var(--color-bg-tertiary-value)] text-[var(--color-text-muted-value)] hover:text-[var(--color-text-base-value)] transition-colors">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-[280px] bg-[var(--color-bg-secondary-value)] border-r border-[var(--color-border-subtle-value)] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="font-heading font-bold text-lg text-[var(--color-text-base-value)]">LifeOS</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full bg-[var(--color-bg-tertiary-value)] text-[var(--color-text-muted-value)]">
                  <X size={16} />
                </button>
              </div>
              <nav className="px-4 pb-6 space-y-1">
                {navItems.map((item) => (
                  <SidebarItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] min-h-screen relative overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-6 py-4 premium-glass border-b border-[var(--color-border-subtle-value)]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-[var(--color-text-base-value)]">
            <Menu size={22} />
          </button>
          <div className="font-heading font-bold text-[var(--color-text-base-value)] tracking-tight">LifeOS</div>
          <button onClick={toggleTheme} className="p-2 -mr-2 text-[var(--color-text-base-value)]">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="p-6 md:p-10 lg:p-12 pb-24 md:pb-12 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <nav className="premium-glass rounded-3xl p-2 flex items-center justify-between shadow-premium border border-[var(--color-border-subtle-value)]">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-2xl w-14 transition-all duration-300 ${
                  isActive ? 'bg-[var(--color-text-base-value)] text-[var(--color-bg-primary-value)] shadow-md' : 'text-[var(--color-text-muted-value)] hover:text-[var(--color-text-base-value)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
                  {isActive && <span className="text-[9px] font-bold font-heading">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
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
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
          isActive 
            ? 'text-[var(--color-text-base-value)] font-semibold' 
            : 'text-[var(--color-text-muted-value)] hover:bg-[var(--color-bg-tertiary-value)]/50 hover:text-[var(--color-text-base-value)] font-medium'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute inset-0 bg-[var(--color-bg-tertiary-value)] rounded-xl border border-[var(--color-border-subtle-value)] shadow-sm"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500' : ''} />
            <span className="text-[14px]">{label}</span>
          </div>
        </>
      )}
    </NavLink>
  )
}
