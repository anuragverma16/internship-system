import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Users, Eye, ToggleLeft, ToggleRight, Briefcase } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { internshipAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function CompanyInternships() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    internshipAPI.getMine().then(r => setInternships(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship? This will also remove all applications.')) return
    try {
      await internshipAPI.delete(id)
      setInternships(prev => prev.filter(i => i._id !== id))
      toast.success('Internship deleted')
    } catch { toast.error('Failed to delete') }
  }

  const toggleStatus = async (internship) => {
    const newStatus = internship.status === 'active' ? 'closed' : 'active'
    try {
      await internshipAPI.update(internship._id, { status: newStatus })
      setInternships(prev => prev.map(i => i._id === internship._id ? { ...i, status: newStatus } : i))
      toast.success(`Internship ${newStatus}`)
    } catch { toast.error('Failed to update') }
  }

  return (
    <DashboardLayout title="My Internships">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">My <span className="gradient-text">Internships</span></h2>
          <p className="text-slate-500 dark:text-slate-400">{internships.length} listing{internships.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/company/post" className="btn-primary">
          <Plus className="w-4 h-4" /> Post New
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card p-5 h-28 shimmer" />)}
        </div>
      ) : internships.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Briefcase className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No internships posted</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Start attracting top talent by posting your first internship</p>
          <Link to="/company/post" className="btn-primary">Post Internship</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <span className={item.status === 'active' ? 'badge-active flex-shrink-0' : 'badge-closed flex-shrink-0'}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{item.type}</span>
                      <span>·</span>
                      <span>{item.duration}</span>
                      <span>·</span>
                      <span>Deadline: {new Date(item.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" /> {item.applicationCount || 0} applicants
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Eye className="w-4 h-4" /> {item.viewCount || 0} views
                      </span>
                      <span className="text-slate-400 text-xs">Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStatus(item)}
                      title={item.status === 'active' ? 'Close listing' : 'Activate listing'}
                      className="btn-ghost text-sm px-3 py-2"
                    >
                      {item.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                    </button>
                    <Link to={`/company/applicants?internship=${item._id}`} className="btn-secondary text-xs px-3 py-2">
                      <Users className="w-3.5 h-3.5" /> Applicants
                    </Link>
                    <button onClick={() => navigate(`/company/edit/${item._id}`)} className="btn-ghost px-3 py-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="btn-ghost px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
