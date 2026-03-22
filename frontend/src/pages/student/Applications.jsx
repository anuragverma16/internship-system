import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, TrendingUp, Send, AlertCircle, FileText, ExternalLink, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { applicationAPI } from '../../services/api'
import { formatDistanceToNow, format } from 'date-fns'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'badge-pending' },
  reviewing: { label: 'Under Review', icon: AlertCircle, className: 'badge-reviewing' },
  shortlisted: { label: 'Shortlisted', icon: TrendingUp, className: 'badge-shortlisted' },
  interview: { label: 'Interview', icon: Send, className: 'badge-interview' },
  accepted: { label: 'Accepted ✓', icon: CheckCircle, className: 'badge-accepted' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'badge-rejected' },
  withdrawn: { label: 'Withdrawn', icon: Trash2, className: 'badge-withdrawn' },
}

const statusFilters = ['all', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected']

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    applicationAPI.getMy(params)
      .then(r => setApplications(r.data.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [filter])

  const withdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    try {
      await applicationAPI.withdraw(id)
      setApplications(prev => prev.filter(a => a._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success('Application withdrawn')
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw')
    }
  }

  const counts = applications.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {})

  return (
    <DashboardLayout title="My Applications">
      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'].map(status => {
          const cfg = statusConfig[status]
          const count = counts[status] || 0
          return (
            <motion.button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-3 text-center transition-all ${filter === status ? 'ring-2 ring-brand-500' : ''}`}
            >
              <cfg.icon className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 custom-scroll">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === s ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s === 'all' ? 'All' : statusConfig[s]?.label}
            {s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Applications list */}
        <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} space-y-3`}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5 h-24 shimmer" />
            ))
          ) : applications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FileText className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">No applications</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {filter !== 'all' ? `No ${filter} applications` : "You haven't applied to any internships yet"}
              </p>
              <Link to="/internships" className="btn-primary">Browse Internships</Link>
            </div>
          ) : (
            applications.map((app, i) => {
              const cfg = statusConfig[app.status] || statusConfig.pending
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(selected?._id === app._id ? null : app)}
                  className={`glass-card p-4 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-all ${
                    selected?._id === app._id ? 'border-brand-400 dark:border-brand-600 ring-1 ring-brand-400 dark:ring-brand-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {app.internship?.company?.logo ? (
                        <img src={app.internship.company.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm">{app.internship?.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{app.internship?.company?.name}</p>
                        </div>
                        <span className={cfg.className}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{app.internship?.type}</span>
                        <span>·</span>
                        <span>Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Application detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:w-1/2 w-full"
            >
              <div className="glass-card p-6 sticky top-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-lg">{selected.internship?.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{selected.internship?.company?.name}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="btn-ghost text-xs">✕</button>
                </div>

                {/* Status timeline */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status Timeline</h4>
                  <div className="space-y-2">
                    {selected.statusHistory?.map((h, i) => {
                      const cfg = statusConfig[h.status] || statusConfig.pending
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${i === selected.statusHistory.length - 1 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm">{cfg.label}</span>
                            <span className="text-xs text-slate-500">{format(new Date(h.changedAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cover letter */}
                {selected.coverLetter && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Cover Letter</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">{selected.coverLetter}</p>
                  </div>
                )}

                {/* Interview details */}
                {selected.status === 'interview' && selected.interviewDate && (
                  <div className="mb-5 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                    <p className="font-semibold text-cyan-700 dark:text-cyan-400 text-sm mb-1">📅 Interview Scheduled</p>
                    <p className="text-sm text-cyan-600 dark:text-cyan-500">{format(new Date(selected.interviewDate), 'EEEE, MMMM dd yyyy')}</p>
                    {selected.interviewType && <p className="text-xs text-cyan-500 mt-0.5">{selected.interviewType}</p>}
                  </div>
                )}

                {/* Company note */}
                {selected.companyNote && (
                  <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Note from Company</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selected.companyNote}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link to={`/internships/${selected.internship?._id}`} className="btn-secondary flex-1 justify-center text-sm">
                    View Listing <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  {!['accepted', 'rejected', 'withdrawn'].includes(selected.status) && (
                    <button onClick={() => withdraw(selected._id)} className="btn-danger text-sm px-4">
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
