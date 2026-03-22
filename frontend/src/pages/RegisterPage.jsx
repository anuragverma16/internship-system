import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Briefcase, ArrowRight, User, Mail, Lock, User2, Building2, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'student')
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', industry: 'Technology', location: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register({ ...form, role })
      toast.success(`Account created! Welcome to InternHub, ${user.name}! 🎉`)
      const map = { student: '/dashboard', company: '/company/dashboard' }
      navigate(map[user.role] || '/')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Media', 'Manufacturing', 'Consulting', 'Startup', 'Other']

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text font-bold text-xl">InternHub</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-1 text-center">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">Join thousands of students and companies</p>

          {/* Role selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            {[
              { value: 'student', label: 'Student', icon: GraduationCap },
              { value: 'company', label: 'Company', icon: Building2 }
              
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  role === r.value
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <r.icon className="w-4 h-4" />
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="name" value={form.name} onChange={onChange} placeholder="John Doe" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={onChange}
                  placeholder="Min. 6 characters" className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {role === 'company' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company Name</label>
                    <input name="companyName" value={form.companyName} onChange={onChange} placeholder="Acme Corp" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Industry</label>
                    <select name="industry" value={form.industry} onChange={onChange} className="input-field">
                      {industries.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Location</label>
                    <input name="location" value={form.location} onChange={onChange} placeholder="San Francisco, CA" className="input-field" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
