import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { applicationAPI, internshipAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDistanceToNow, format } from 'date-fns'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  reviewing: { label: 'Reviewing', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  shortlisted: { label: 'Shortlisted', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  interview: { label: 'Interview', icon: Send, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
}

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to || '#'}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-card p-5 card-hover"
      >
        <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className="text-2xl font-bold mb-0.5">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </motion.div>
    </Link>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      applicationAPI.getMy({ limit: 5 }),
      internshipAPI.getFeatured()
    ]).then(([appRes, featRes]) => {
      setApplications(appRes.data.data)
      setFeatured(featRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  const profileComplete = (() => {
    const p = user?.studentProfile
    if (!p) return 0
    let score = 0
    if (p.university) score += 20
    if (p.skills?.length) score += 20
    if (p.bio) score += 20
    if (p.resume) score += 20
    if (p.linkedIn) score += 20
    return score
  })()

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Here's your internship journey overview</p>
        </motion.div>
      </div>

      {/* Profile completion banner */}
      {profileComplete < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 border-l-4 border-brand-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">Complete your profile to get better matches</p>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileComplete}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{profileComplete}% complete</p>
            </div>
            <Link to="/profile" className="btn-primary text-sm whitespace-nowrap">
              Complete <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Total Applied', value: applications.length, color: 'text-brand-500', to: '/applications' },
          { icon: CheckCircle, label: 'Accepted', value: statusCounts.accepted || 0, color: 'text-emerald-500', to: '/applications?status=accepted' },
          { icon: TrendingUp, label: 'Shortlisted', value: (statusCounts.shortlisted || 0) + (statusCounts.interview || 0), color: 'text-violet-500', to: '/applications' },
          { icon: Bookmark, label: 'Saved', value: user?.studentProfile?.savedInternships?.length || 0, color: 'text-amber-500', to: '/saved' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Applications</h3>
            <Link to="/applications" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-4 h-20 shimmer" />
              ))
            ) : applications.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="font-semibold mb-1">No applications yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Start applying to internships to track them here</p>
                <Link to="/internships" className="btn-primary text-sm">Browse Internships</Link>
              </div>
            ) : (
              applications.map((app, i) => {
                const cfg = statusConfig[app.status] || statusConfig.pending
                const StatusIcon = cfg.icon
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{app.internship?.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.internship?.company?.name} · {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg} flex-shrink-0`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Featured internships sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recommended</h3>
            <Link to="/internships" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">See all</Link>
          </div>

          <div className="space-y-3">
            {featured.slice(0, 4).map((internship, i) => (
              <motion.div
                key={internship._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/internships/${internship._id}`}>
                  <div className="glass-card p-4 card-hover">
                    <p className="font-semibold text-sm mb-0.5 line-clamp-1">{internship.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{internship.company?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">{internship.type}</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {internship.stipend?.isPaid ? `$${internship.stipend.min?.toLocaleString()}/mo` : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-4">
            <Link to="/internships" className="btn-secondary w-full justify-center text-sm">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
