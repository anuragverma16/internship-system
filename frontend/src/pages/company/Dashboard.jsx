import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Users, Eye, Plus, TrendingUp, ArrowRight, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { internshipAPI, applicationAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const statusConfig = {
  pending: { label: 'Pending', className: 'badge-pending' },
  reviewing: { label: 'Reviewing', className: 'badge-reviewing' },
  shortlisted: { label: 'Shortlisted', className: 'badge-shortlisted' },
  interview: { label: 'Interview', className: 'badge-interview' },
  accepted: { label: 'Accepted', className: 'badge-accepted' },
  rejected: { label: 'Rejected', className: 'badge-rejected' },
}

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      internshipAPI.getMine(),
      applicationAPI.getCompanyApps({ limit: 8 })
    ]).then(([iRes, aRes]) => {
      setInternships(iRes.data.data || [])
      setApplications(aRes.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const activeCount = internships.filter(i => i.status === 'active').length
  const totalApps = internships.reduce((s, i) => s + (i.applicationCount || 0), 0)
  const pendingApps = applications.filter(a => a.status === 'pending').length
  const acceptedApps = applications.filter(a => a.status === 'accepted').length

  const stats = [
    { label: 'Active Listings', value: activeCount, icon: Briefcase, color: 'text-brand-500', to: '/company/internships' },
    { label: 'Total Applications', value: totalApps, icon: Users, color: 'text-violet-500', to: '/company/applicants' },
    { label: 'Pending Review', value: pendingApps, icon: Clock, color: 'text-amber-500', to: '/company/applicants' },
    { label: 'Accepted', value: acceptedApps, icon: CheckCircle, color: 'text-emerald-500', to: '/company/applicants' },
  ]

  return (
    <DashboardLayout title="Company Dashboard">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Welcome, <span className="gradient-text">{user?.name}</span> 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your internship listings and applicants</p>
        </div>
        <Link to="/company/post" className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Post Internship
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={stat.to}>
              <div className="glass-card p-5 card-hover">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold mb-0.5">{loading ? '—' : stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Internships */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">My Internships</h3>
            <Link to="/company/internships" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card p-4 h-20 shimmer" />) :
              internships.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-semibold mb-1">No listings yet</p>
                  <Link to="/company/post" className="btn-primary text-sm mt-2">Post First Internship</Link>
                </div>
              ) : internships.slice(0, 5).map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} · {item.type}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        {item.applicationCount || 0}
                      </div>
                      <span className={item.status === 'active' ? 'badge-active' : 'badge-closed'}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

        {/* Recent Applicants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Applicants</h3>
            <Link to="/company/applicants" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-4 h-20 shimmer" />) :
              applications.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-semibold mb-1">No applicants yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Applications will appear here once students apply</p>
                </div>
              ) : applications.map((app, i) => {
                const cfg = statusConfig[app.status] || statusConfig.pending
                return (
                  <motion.div key={app._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className="glass-card p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {app.applicant?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{app.applicant?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.internship?.title}</p>
                      </div>
                      <span className={`${cfg.className} flex-shrink-0`}>{cfg.label}</span>
                    </div>
                  </motion.div>
                )
              })
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
