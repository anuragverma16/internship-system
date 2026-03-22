import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Building2, MapPin, DollarSign, Clock, BookmarkX } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function StudentSaved() {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userAPI.getSaved().then(r => setSaved(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const unsave = async (id) => {
    try {
      await userAPI.saveInternship(id)
      setSaved(prev => prev.filter(i => i._id !== id))
      toast.success('Removed from saved')
    } catch { toast.error('Failed to unsave') }
  }

  return (
    <DashboardLayout title="Saved Internships">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Saved <span className="gradient-text">Internships</span></h2>
        <p className="text-slate-500 dark:text-slate-400">{saved.length} internship{saved.length !== 1 ? 's' : ''} saved</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-5 h-36 shimmer" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bookmark className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No saved internships</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Browse internships and bookmark the ones you like</p>
          <Link to="/internships" className="btn-primary">Browse Internships</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saved.map((internship, i) => (
            <motion.div key={internship._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="glass-card p-5 card-hover relative group">
                <button
                  onClick={() => unsave(internship._id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
                  title="Remove from saved"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>

                <Link to={`/internships/${internship._id}`}>
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {internship.company?.logo ? <img src={internship.company.logo} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{internship.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{internship.company?.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs">{internship.category}</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">{internship.type}</span>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{internship.location?.isRemote ? 'Remote' : internship.location?.city}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{internship.duration}</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      {internship.stipend?.isPaid ? `$${internship.stipend.min?.toLocaleString()}/mo` : 'Unpaid'}
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
