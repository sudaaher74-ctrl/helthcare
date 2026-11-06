import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AnimatePresence } from 'framer-motion'

// Layout
import AppLayout from '@/components/layout/AppLayout'

// Lazy-loaded routes for optimal chunking & bundle performance
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const HabitTracker = lazy(() => import('@/pages/HabitTracker'))
const NutritionDashboard = lazy(() => import('@/pages/NutritionDashboard'))
const WorkoutTracker = lazy(() => import('@/pages/WorkoutTracker'))
const GymPlanner = lazy(() => import('@/pages/GymPlanner'))
const SleepTracker = lazy(() => import('@/pages/SleepTracker'))
const WeightTracker = lazy(() => import('@/pages/WeightTracker'))
const GoalsPage = lazy(() => import('@/pages/GoalsPage'))
const TasksPage = lazy(() => import('@/pages/TasksPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'))
const FinanceTracker = lazy(() => import('@/pages/FinanceTracker'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { setAuth } = useAuthStore()

  // Apply mesh background gradient and initialize default personal session if not authenticated
  useEffect(() => {
    document.title = 'Sankalp — Your Personal Life Operating System'
    if (!useAuthStore.getState().isAuthenticated) {
      setAuth(
        {
          id: 'local-personal-user',
          email: 'personal@sankalp.local',
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
    }
  }, [setAuth])

  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Application Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="habits" element={<HabitTracker />} />
              <Route path="nutrition" element={<NutritionDashboard />} />
              <Route path="workout" element={<WorkoutTracker />} />
              <Route path="gym" element={<GymPlanner />} />
              <Route path="sleep" element={<SleepTracker />} />
              <Route path="weight" element={<WeightTracker />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="finance" element={<FinanceTracker />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}
