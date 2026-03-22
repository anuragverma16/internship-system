import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Briefcase, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/internships', label: 'Browse' },
  { to: '/#features', label: 'Features' },
  { to: '/#companies', label: 'Companies' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setDropdownOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    const map = { student: '/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' }
    return map[user.role]
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-card rounded-none border-x-0 border-t-0 shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg gradient-text">InternHub</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-600"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(d => !d)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-24 truncate">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-12 z-50 w-52 glass-card shadow-card-hover py-1"
                    >
                      <div className="px-3 py-2 border-b border-[var(--border)]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{user.role}</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {user.role === 'student' && (
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(m => !m)}
            className="md:hidden btn-ghost w-9 h-9 rounded-xl flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card rounded-none border-x-0 border-b overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="block px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl text-rose-600 text-sm">Sign Out</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 justify-center">Sign In</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
