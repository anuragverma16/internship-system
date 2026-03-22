import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Search, Star, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { internshipAPI, adminAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminInternships() {
  const [internships, setInternships] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const categories = ['', 'Software Engineering', 'Data Science', 'Design', 'Marketing', 'Finance', 'Business', 'Research', 'Sales', 'Other']

  const fetch = () => {
    setLoading(true)
    const params = { page, limit: 15 }
    if (search) params.search = search
    if (category) params.category = category
    internshipAPI.getAll(params)
      .then(r => { setInternships(r.data.data); setPagination(r.data.pagination) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [page, category])
  useEffect(() => { const t = setTimeout(fetch, 400); return () => clearTimeout(t) }, [search])

  const toggleFeature = async (id, current) => {
    try {
      await adminAPI.featureInternship(id)
      setInternships(prev => prev.map(i => i._id === id ? { ...i, isFeatured: !current } : i))
      toast.success(current ? 'Removed from featured' : 'Marked as featured')
    } catch { toast.error('Failed') }
  }

  const deleteInternship = async (id, title) => {
    if (!confirm(`Delete internship "${title}"? This will also delete all applications.`)) return
    try {
      await internshipAPI.delete(id)
      setInternships(prev => prev.filter(i => i._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <DashboardLayout title="Internship Management">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Manage <span className="gradient-text">Internships</span></h2>
        <p className="text-slate-500 dark:text-slate-400">{pagination.total || 0} total listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search internships..." className="input-field pl-10" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="input-field sm:w-48">
          {categories.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Internship', 'Company', 'Category', 'Applications', 'Status', 'Posted', 'Actions'].map(h => (
                  <th key={h} className={`text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${['Applications', 'Posted'].includes(h) ? 'hidden md:table-cell' : ''} ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-8 shimmer rounded" /></td></tr>
                ))
              ) : internships.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-500">No internships found</td></tr>
              ) : internships.map((item, i) => (
                <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-3 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      {item.isFeatured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.company?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs">{item.category}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">{item.applicationCount || 0}</td>
                  <td className="px-5 py-3">
                    <span className={item.status === 'active' ? 'badge-active' : 'badge-closed'}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/internships/${item._id}`} className="btn-ghost px-2 py-1.5" title="View listing">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => toggleFeature(item._id, item.isFeatured)} title={item.isFeatured ? 'Unfeature' : 'Feature'}
                        className={`btn-ghost px-2 py-1.5 ${item.isFeatured ? 'text-amber-500' : 'text-slate-400'}`}
                      >
                        <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button onClick={() => deleteInternship(item._id, item.title)} className="btn-ghost px-2 py-1.5 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost px-3 py-2 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-ghost px-3 py-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </DashboardLayout>
  )
}
