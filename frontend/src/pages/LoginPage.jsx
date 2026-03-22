import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Briefcase, ArrowRight, Lock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}! 👋`)
      const map = { student: '/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' }
      navigate(map[user.role] || '/')
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const demoAccounts = [
    { label: 'Admin Demo', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
  ]

  const loginAsDemo = async (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setLoading(true)
    try {
      const user = await login(acc.email, acc.password)
      toast.success(`Logged in as ${acc.label}`)
      const map = { student: '/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' }
      navigate(map[user.role] || '/')
    } catch {
      toast.error('Account not set up yet. Please create account')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-violet-600">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <Link to="/" className="flex items-center gap-2.5 font-bold mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">InternHub</span>
          </Link>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Your career<br />starts here.
          </h2>
          <p className="text-brand-100 text-lg leading-relaxed mb-12 max-w-md">
            Join thousands of students who found their dream internships and kickstarted their careers through InternHub.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', text: '2+ active internship listings' },
              { icon: '🏢', text: '2+ verified companies hiring now' },
              { icon: '⚡', text: 'Apply in under 2 minutes' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-brand-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text font-bold text-lg">InternHub</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="email" type="email" value={form.email} onChange={onChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={onChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
              <div className="relative text-center"><span className="bg-[var(--bg-primary)] px-3 text-xs text-slate-500">Or try a demo account</span></div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {demoAccounts.map((acc) => (
                <button key={acc.role} onClick={() => loginAsDemo(acc)} disabled={loading}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
