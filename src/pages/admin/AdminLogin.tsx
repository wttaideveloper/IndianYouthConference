import { useState, FormEvent } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Lock, User, Loader2, AlertCircle, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { login, isLoggedIn } from '../../lib/adminApi'
import { EVENT } from '../../data/content'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn()) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/20" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8 shadow-2xl shadow-primary/40">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Registration<br />Management
          </h1>
          <p className="text-white/60 leading-relaxed mb-8">
            Manage conference registrations, verify payments, and export attendee data for {EVENT.name}.
          </p>
          <div className="space-y-3 text-sm text-white/50">
            <p>📅 {EVENT.dates}</p>
            <p>📍 Mount Zion Campus, Pudukkottai</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#f0f2f8]">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to website
          </Link>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-navy/5 border border-gray-100">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-navy">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to the admin dashboard</p>
            </div>

            {error && (
              <div className="mb-6 flex gap-2 items-start bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-modern pl-10! bg-gray-50/40"
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-10! pr-11! bg-gray-50/40"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
