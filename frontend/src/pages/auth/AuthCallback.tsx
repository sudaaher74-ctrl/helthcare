import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    const refresh = params.get('refresh')
    const onboarded = params.get('onboarded')

    if (token && refresh) {
      // Fetch user profile with the new token
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setAuth(res.data.data, token, refresh)
          toast.success('Signed in with Google! 🎉')
          navigate(onboarded === 'false' ? '/onboarding' : '/dashboard')
        })
        .catch(() => {
          toast.error('Authentication failed')
          navigate('/login')
        })
    } else {
      toast.error('Authentication failed')
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  )
}
