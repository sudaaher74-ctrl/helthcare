import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AnimatePresence } from 'framer-motion'

// Layout
import AppLayout from '@/components/layout/AppLayout'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import AuthCallback from '@/pages/auth/AuthCallback'

// Main Pages
import Dashboard from '@/pages/Dashboard'
import HabitTracker from '@/pages/HabitTracker'
import NutritionDashboard from '@/pages/NutritionDashboard'
import WorkoutTracker from '@/pages/WorkoutTracker'
import SleepTracker from '@/pages/SleepTracker'
import WeightTracker from '@/pages/WeightTracker'
import GoalsPage from '@/pages/GoalsPage'
import TasksPage from '@/pages/TasksPage'
import CalendarPage from '@/pages/CalendarPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AchievementsPage from '@/pages/AchievementsPage'
import SettingsPage from '@/pages/SettingsPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !user.isOnboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  const { setAuth } = useAuthStore()

  // Apply mesh background gradient and force personal user auth
  useEffect(() => {
    document.title = 'LifeOS — Your Personal Life Operating System'
    setAuth(
      {
        id: 'local-personal-user',
        email: 'personal@lifeos.local',
        name: 'Personal User',
        dailyCalorieGoal: 2500,
        dailyProteinGoal: 150,
        dailyWaterGoal: 3000,
        theme: 'DARK',
        isOnboarded: true,
      },
      'mock-token',
      'mock-refresh'
    )
  }, [setAuth])

  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected App */}
          <Route
            path="/"
            element={
              <OnboardingGuard>
                <AppLayout />
              </OnboardingGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="habits" element={<HabitTracker />} />
            <Route path="nutrition" element={<NutritionDashboard />} />
            <Route path="workout" element={<WorkoutTracker />} />
            <Route path="sleep" element={<SleepTracker />} />
            <Route path="weight" element={<WeightTracker />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
