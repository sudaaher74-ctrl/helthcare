import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data)
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.name}! 👋`)
      navigate(user.isOnboarded ? '/dashboard' : '/onboarding')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-bg-primary-value)]">
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mb-4 shadow-xl shadow-violet-500/20">
          <Zap size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 tracking-tight">Sankalp</h1>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="w-full max-w-[400px] bg-[var(--color-bg-secondary-value)] border border-[var(--color-border-subtle-value)] rounded-[24px] p-8 shadow-[var(--shadow-premium)] relative overflow-hidden"
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold font-heading text-[var(--color-text-base-value)] tracking-tight mb-1.5">Welcome back</h2>
          <p className="text-[14px] text-[var(--color-text-muted-value)]">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-[var(--color-text-base-value)] ml-1">Email address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-value)]" />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] text-[var(--color-text-base-value)] text-[15px] rounded-xl py-3 pl-11 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-[var(--color-text-muted-value)]/50"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-[13px] font-semibold text-[var(--color-text-base-value)]">Password</label>
              <a href="#" className="text-[12px] font-medium text-violet-600 hover:text-violet-500 transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-value)]" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-[var(--color-bg-primary-value)] border border-[var(--color-border-subtle-value)] text-[var(--color-text-base-value)] text-[15px] rounded-xl py-3 pl-11 pr-11 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-[var(--color-text-muted-value)]/50"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-value)] hover:text-[var(--color-text-base-value)] transition-colors p-1"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-text-base-value)] text-[var(--color-bg-primary-value)] py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[var(--color-bg-primary-value)]/30 border-t-[var(--color-bg-primary-value)] rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[var(--color-text-muted-value)] mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--color-text-base-value)] font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

