import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from '../components/Logo'
import { Lock, Mail } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prefill = localStorage.getItem('prefill_email')
    if (prefill) {
      setForm(prev => ({ ...prev, email: prefill }))
      localStorage.removeItem('prefill_email')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 py-10 transition-colors duration-200
      ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}
    >
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>SmartRisk AI</h1>
          <p className={`text-base mt-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Software Project Risk Prediction System
          </p>
        </div>

        <div className="card">
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Login to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  type="email"
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  type="password"
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

          {/* Bottom Link */}
          <p className={`text-center text-sm mt-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-500 hover:underline font-medium">
              Sign up
            </Link>
          </p>

        </div>

        <p className={`text-center text-xs mt-6 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
          Smart AI System for Software Project Risk Prediction and Process Optimisation
        </p>

      </div>
    </div>
  )
}
