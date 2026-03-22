import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, MapPin, Clock, DollarSign, Users, Calendar, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle, ExternalLink, Send, Briefcase } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { internshipAPI, applicationAPI, userAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function InternshipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isStudent } = useAuth()
  const [internship, setInternship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    internshipAPI.getOne(id)
      .then(r => {
        setInternship(r.data.data)
        setIsSaved(r.data.data.isSaved)
        setHasApplied(r.data.data.hasApplied)
      })
      .catch(() => { toast.error('Internship not found'); navigate('/internships') })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save'); return }
    try {
      const res = await userAPI.saveInternship(id)
      setIsSaved(res.data.isSaved)
      toast.success(res.data.message)
    } catch { toast.error('Failed') }
  }

  const handleApply = async () => {
    if (!user) { toast.error('Please login to apply'); navigate('/login'); return }
    if (!user.studentProfile?.resume) { toast.error('Please upload your resume first'); navigate('/profile'); return }
    setApplying(true)
    try {
      await applicationAPI.apply(id, { coverLetter })
      setHasApplied(true)
      setShowApplyModal(false)
      toast.success('Application submitted! 🎉')
    } catch (err) {
      toast.error(err.message || 'Application failed')
    } finally { setApplying(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="pt-24 px-4 max-w-5xl mx-auto">
        <div className="glass-card p-8 h-64 shimmer mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 glass-card p-8 h-96 shimmer" />
          <div className="glass-card p-8 h-64 shimmer" />
        </div>
      </div>
    </div>
  )

  if (!internship) return null

  const isExpired = new Date(internship.applicationDeadline) < new Date()
  const canApply = isStudent && !hasApplied && !isExpired && internship.status === 'active'

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2 flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border)]">
                {internship.company?.logo ? (
                  <img src={internship.company.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{internship.title}</h1>
                      {internship.isFeatured && <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">⭐ Featured</span>}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{internship.company?.name}</span>
                      {internship.company?.isVerified && <span className="text-brand-500 text-sm">✓ Verified</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={handleSave} className={`btn-ghost px-3 py-2 ${isSaved ? 'text-brand-500' : ''}`}>
                      {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-sm font-medium">{internship.category}</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">{internship.type}</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">{internship.experienceLevel}</span>
                  <span className={internship.status === 'active' ? 'badge-active' : 'badge-closed'}>{internship.status}</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
              {[
                { icon: MapPin, label: 'Location', value: internship.location?.isRemote ? '🌍 Remote' : internship.location?.city || 'N/A' },
                { icon: DollarSign, label: 'Stipend', value: internship.stipend?.isPaid ? `$${internship.stipend.min?.toLocaleString()} – $${internship.stipend.max?.toLocaleString()}/mo` : 'Unpaid' },
                { icon: Clock, label: 'Duration', value: internship.duration },
                { icon: Calendar, label: 'Deadline', value: isExpired ? '❌ Expired' : format(new Date(internship.applicationDeadline), 'MMM dd, yyyy') },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">
              {[
                { title: 'About the Role', content: internship.description },
                { title: 'Responsibilities', content: internship.responsibilities },
                { title: 'Requirements', content: internship.requirements },
              ].filter(s => s.content).map(section => (
                <div key={section.title} className="glass-card p-5">
                  <h2 className="font-bold text-lg mb-3">{section.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}

              {/* Skills */}
              {internship.skills?.length > 0 && (
                <div className="glass-card p-5">
                  <h2 className="font-bold text-lg mb-3">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Perks */}
              {internship.perks?.length > 0 && (
                <div className="glass-card p-5">
                  <h2 className="font-bold text-lg mb-3">Perks & Benefits</h2>
                  <div className="flex flex-wrap gap-2">
                    {internship.perks.map(p => (
                      <span key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
              {/* Apply card */}
              <div className="glass-card p-5">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <Users className="w-4 h-4" />
                    <span>{internship.applicationCount || 0} applicants · {internship.openings} opening{internship.openings !== 1 ? 's' : ''}</span>
                  </div>

                  {hasApplied ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Applied!</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Your application is under review</p>
                      <Link to="/applications" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">Track Application</Link>
                    </div>
                  ) : canApply ? (
                    <button onClick={() => setShowApplyModal(true)} className="btn-primary w-full justify-center py-3 text-base">
                      <Send className="w-4 h-4" /> Apply Now
                    </button>
                  ) : !user ? (
                    <div className="space-y-2">
                      <Link to="/login" className="btn-primary w-full justify-center py-3">Sign In to Apply</Link>
                      <Link to="/register" className="btn-secondary w-full justify-center text-sm">Create Account</Link>
                    </div>
                  ) : isExpired ? (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                      <p className="font-semibold text-slate-500">Application Closed</p>
                    </div>
                  ) : user?.role === 'company' ? (
                    <p className="text-sm text-slate-500 text-center">Company accounts cannot apply to internships</p>
                  ) : null}
                </div>

                {!isExpired && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Closes {formatDistanceToNow(new Date(internship.applicationDeadline), { addSuffix: true })}
                  </p>
                )}
              </div>

              {/* Company info */}
              {internship.company && (
                <div className="glass-card p-5">
                  <h3 className="font-bold mb-4">About the Company</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {internship.company.logo ? <img src={internship.company.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{internship.company.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{internship.company.industry}</p>
                    </div>
                  </div>
                  {internship.company.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">{internship.company.description}</p>
                  )}
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {internship.company.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{internship.company.location}</div>}
                    {internship.company.size && <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{internship.company.size} employees</div>}
                    {internship.company.website && (
                      <a href={internship.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-500 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowApplyModal(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-lg"
            >
              <h2 className="text-xl font-bold mb-1">Apply to {internship.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{internship.company?.name}</p>

              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Your saved resume will be submitted with this application
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  rows={5} placeholder="Tell the company why you're interested in this role and why you'd be a great fit..."
                  className="input-field resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{coverLetter.length}/3000 characters</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleApply} disabled={applying} className="btn-primary flex-1 justify-center">
                  {applying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</span> : <><Send className="w-4 h-4" />Submit Application</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
