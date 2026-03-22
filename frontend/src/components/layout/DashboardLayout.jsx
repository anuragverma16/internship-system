import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, LayoutDashboard, User, FileText, Bookmark, Building2,
  LogOut, Sun, Moon, Menu, Bell, ChevronRight,
  Users, BarChart3, Plus, Eye, List
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

const studentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/internships', icon: Briefcase, label: 'Browse' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const companyNav = [
  { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/company/internships', icon: List, label: 'My Internships' },
  { to: '/company/post', icon: Plus, label: 'Post Internship' },
  { to: '/company/applicants', icon: Users, label: 'Applicants' },
  { to: '/company/profile', icon: Building2, label: 'Company Profile' },
]

const adminNav = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/internships', icon: Briefcase, label: 'Internships' },
  { to: '/internships', icon: Eye, label: 'View Platform' },
]

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = user?.role === 'student' ? studentNav
    : user?.role === 'company' ? companyNav
    : adminNav

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  const isActive = (to) => location.pathname === to

  return (
    // FIX: h-screen + overflow-hidden on root — scroll sirf main ke andar hoga
    <div className="flex h-screen overflow-hidden bg-[var(--bg-secondary)]">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
        w-64 flex-shrink-0 flex flex-col
        bg-[var(--bg-primary)] border-r border-[var(--border)]
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)] flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text text-lg">InternHub</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav items — scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scroll">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={isActive(item.to) ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {isActive(item.to) && <ChevronRight className="w-4 h-4 ml-auto text-brand-500" />}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-[var(--border)] space-y-1 flex-shrink-0">
          <button onClick={toggle} className="sidebar-item w-full">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────────── */}
      {/* FIX: flex-col + min-w-0 + h-full so it stays within screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar — fixed height, never scrolls */}
        <header className="flex-shrink-0 h-16 bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center px-4 sm:px-6 gap-4 z-30 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <h1 className="font-bold text-lg truncate flex-1 text-slate-800 dark:text-slate-100">{title}</h1>

          {/* Right side action buttons */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            <button
              title="Notifications"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-200
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-200 dark:border-slate-700
                transition-colors"
            >
              <Bell className="w-4 h-4" />
              {/* red dot badge */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
            </button>

            {/* Dark / Light mode toggle */}
            <button
              onClick={toggle}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-10 h-10 rounded-xl flex items-center justify-center
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-200
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-200 dark:border-slate-700
                transition-colors"
            >
              {dark
                ? <Sun  className="w-4 h-4 text-amber-500" />
                : <Moon className="w-4 h-4 text-brand-500" />
              }
            </button>

            {/* User avatar pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold select-none">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

          </div>
        </header>

        {/* Page content — THIS is the only scroll area */}
        {/* FIX: overflow-y-auto only here, flex-1 takes remaining height */}
        <main className="flex-1 overflow-y-auto custom-scroll">
          <div className="p-4 sm:p-6">
            {/* FIX: Removed motion.div with y:16 — it caused scroll jump on every keypress */}
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}