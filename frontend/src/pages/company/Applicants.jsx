import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Filter, ExternalLink, Download, CheckCircle, XCircle, Calendar, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { applicationAPI } from '../../services/api'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const statuses = ['all', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected']
const statusConfig = {
  pending: { label: 'Pending', className: 'badge-pending' },
  reviewing: { label: 'Reviewing', className: 'badge-reviewing' },
  shortlisted: { label: 'Shortlisted', className: 'badge-shortlisted' },
  interview: { label: 'Interview', className: 'badge-interview' },
  accepted: { label: 'Accepted', className: 'badge-accepted' },
  rejected: { label: 'Rejected', className: 'badge-rejected' },
}

export default function CompanyApplicants() {
  const [searchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [interviewDate, setInterviewDate] = useState('')

  useEffect(() => {
    const params = filter !== 'all' ? { status: filter } : {}
    setLoading(true)
    applicationAPI.getCompanyApps(params)
      .then(r => setApplications(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [filter])

  const updateStatus = async (appId, status) => {
    setUpdating(true)
    try {
      const payload = { status, note }
      if (status === 'interview' && interviewDate) payload.interviewDate = interviewDate
      const res = await applicationAPI.updateStatus(appId, payload)
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a))
      if (selected?._id === appId) setSelected(prev => ({ ...prev, status }))
      toast.success(`Application ${status}`)
      setNote('')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally { setUpdating(false) }
  }

  const counts = applications.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {})

  return (
    <DashboardLayout title="Applicants">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Manage <span className="gradient-text">Applicants</span></h2>
        <p className="text-slate-500 dark:text-slate-400">{applications.length} application{applications.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 custom-scroll">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === s ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s === 'all' ? 'All' : statusConfig[s]?.label}
            {s !== 'all' && counts[s] ? <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${filter === s ? 'bg-white/20' : 'bg-slate-300 dark:bg-slate-600'}`}>{counts[s]}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* List */}
        <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} space-y-3`}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card p-5 h-24 shimmer" />)
          ) : applications.length === 0 ? (
            <div className="glass-card p-14 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-semibold">No applicants</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Applications will appear here</p>
            </div>
          ) : applications.map((app, i) => {
            const cfg = statusConfig[app.status] || statusConfig.pending
            const profile = app.applicant?.studentProfile
            return (
              <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(selected?._id === app._id ? null : app)}
                className={`glass-card p-4 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-all ${
                  selected?._id === app._id ? 'border-brand-400 dark:border-brand-600 ring-1 ring-brand-400' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {app.applicant?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm">{app.applicant?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {profile?.university} {profile?.major && `· ${profile.major}`}
                        </p>
                      </div>
                      <span className={`${cfg.className} flex-shrink-0`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-400">For: {app.internship?.title}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                    </div>
                    {profile?.skills?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {profile.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:w-1/2 w-full">
              <div className="glass-card p-6 sticky top-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-lg">{selected.applicant?.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selected.applicant?.email}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="btn-ghost text-xs px-2">✕</button>
                </div>

                {/* Profile summary */}
                {selected.applicant?.studentProfile && (
                  <div className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    {selected.applicant.studentProfile.university && (
                      <p className="text-sm"><span className="text-slate-500">University:</span> {selected.applicant.studentProfile.university}</p>
                    )}
                    {selected.applicant.studentProfile.major && (
                      <p className="text-sm"><span className="text-slate-500">Major:</span> {selected.applicant.studentProfile.major}</p>
                    )}
                    {selected.applicant.studentProfile.gpa && (
                      <p className="text-sm"><span className="text-slate-500">GPA:</span> {selected.applicant.studentProfile.gpa}</p>
                    )}
                    {selected.applicant.studentProfile.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selected.applicant.studentProfile.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Cover letter */}
                {selected.coverLetter && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cover Letter</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-h-32 overflow-y-auto custom-scroll">{selected.coverLetter}</p>
                  </div>
                )}

                {/* Resume download */}
                {selected.resume && (
                  <a href={selected.resume} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary w-full justify-center text-sm mb-5"
                  >
                    <Download className="w-4 h-4" /> Download Resume
                  </a>
                )}

                {/* Interview date input */}
                {!['accepted', 'rejected'].includes(selected.status) && (
                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Add Note (optional)</label>
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Internal note for this application..." className="input-field resize-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Interview Date (if scheduling interview)</label>
                      <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="input-field text-sm" />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!['accepted', 'rejected'].includes(selected.status) ? (
                  <div className="grid grid-cols-2 gap-2">
                    {['reviewing', 'shortlisted', 'interview'].map(s => (
                      <button key={s} onClick={() => updateStatus(selected._id, s)} disabled={updating || selected.status === s}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                          selected.status === s ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100'
                        }`}
                      >
                        {statusConfig[s]?.label}
                      </button>
                    ))}
                    <button onClick={() => updateStatus(selected._id, 'accepted')} disabled={updating}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => updateStatus(selected._id, 'rejected')} disabled={updating}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl text-center text-sm font-semibold ${selected.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'}`}>
                    {selected.status === 'accepted' ? '✅ Application Accepted' : '❌ Application Rejected'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
