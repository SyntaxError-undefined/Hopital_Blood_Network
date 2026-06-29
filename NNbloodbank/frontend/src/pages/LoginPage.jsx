import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Droplets, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { apiGet } from '@/services/api'
import { login } from '@/services/auth'
import { useAuth } from '@/hooks'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [email, setEmail] = useState('manager@jeevansetu.demo')
  const [password, setPassword] = useState('password123')
  const [hospitals, setHospitals] = useState([])
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('jeevansetu_hospital_id') || '')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/hospitals')
      .then((items) => {
        setHospitals(items)
        if (!hospitalId && items.length > 0) {
          setHospitalId(String(items[0].id))
        }
      })
      .catch(() => {
        setError('Could not load hospitals. Check that the backend is running.')
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await login({ email, password, hospitalId })
      if (result.success) {
        setAuth({ hospitalId, email, name: result.user?.name })
        navigate('/dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <Droplets className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">JeevanSetu</h1>
              <p className="text-sm text-text-muted">AI-Powered Hospital Blood Network</p>
            </div>
          </div>

          <h2 className="text-display text-text">Welcome Back</h2>
          <p className="mt-2 text-sm text-text-muted">Sign in to your hospital dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-critical">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Hospital</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="hospital@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-text-light">
            Demo credentials pre-filled. Any email/password will work.
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-[#FEF2F2] p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg text-center"
        >
          <div className="mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-primary/10">
            <svg viewBox="0 0 200 200" className="h-36 w-36" fill="none">
              <rect x="60" y="40" width="80" height="120" rx="12" fill="#C62828" opacity="0.15" />
              <rect x="70" y="50" width="60" height="100" rx="8" fill="#C62828" opacity="0.3" />
              <path d="M100 70 C100 70 85 85 85 95 C85 105 92 110 100 110 C108 110 115 105 115 95 C115 85 100 70 100 70Z" fill="#C62828" />
              <rect x="95" y="110" width="10" height="40" rx="3" fill="#C62828" opacity="0.6" />
              <circle cx="100" cy="155" r="8" fill="#EF5350" />
              <path d="M40 100 Q60 80 80 100" stroke="#2E7D32" strokeWidth="3" fill="none" opacity="0.5" />
              <path d="M120 100 Q140 80 160 100" stroke="#2E7D32" strokeWidth="3" fill="none" opacity="0.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text">Saving Lives Through Smart Blood Management</h2>
          <p className="mt-4 text-text-muted leading-relaxed">
            Connect with hospitals across the network. Predict shortages before they happen.
            Optimize transfers with AI-powered insights.
          </p>
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">6</p>
              <p className="text-sm text-text-muted">Hospitals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1,500+</p>
              <p className="text-sm text-text-muted">Blood Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">87%</p>
              <p className="text-sm text-text-muted">AI Accuracy</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
