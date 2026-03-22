import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Building2, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { internshipAPI, userAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const categories = ['', 'Software Engineering', 'Data Science', 'Design', 'Marketing', 'Finance', 'Business', 'Research', 'Sales', 'Operations', 'HR', 'Legal', 'Other']
const types = ['', 'Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site']
const levels = ['', 'Fresher', 'Beginner', 'Intermediate', 'Advanced']

function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded shimmer" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 shimmer" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full shimmer" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full shimmer" />
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full shimmer" />
    </div>
  )
}

export default function InternshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [internships, setInternships] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    type: '',
    isRemote: '',
    experienceLevel: '',
    page: 1,
  })

  const { user, isStudent } = useAuth()

  const fetchInternships = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const res = await internshipAPI.getAll(params)
      setInternships(res.data.data)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to fetch internships')
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchInternships() }, [fetchInternships])

  useEffect(() => {
    if (isStudent) {
      userAPI.getSaved().then(r => {
        const ids = new Set(r.data.data.map(i => i._id))
        setSavedIds(ids)
      }).catch(() => {})
    }
  }, [isStudent])

  const toggleSave = async (id, e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to save internships'); return }
    try {
      const res = await userAPI.saveInternship(id)
      setSavedIds(prev => {
        const next = new Set(prev)
        if (res.data.isSaved) next.add(id); else next.delete(id)
        return next
      })
      toast.success(res.data.message)
    } catch { toast.error('Failed to save') }
  }

  const updateFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', type: '', isRemote: '', experienceLevel: '', page: 1 })
  }

  const hasActiveFilters = filters.category || filters.type || filters.isRemote || filters.experienceLevel

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="py-8">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-2">
              Browse <span className="gradient-text">Internships</span>
            </motion.h1>
            <p className="text-slate-500 dark:text-slate-400">{pagination.total || 0} opportunities available</p>
          </div>

          {/* Search + Filter bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search internships, skills, companies..."
                className="input-field pl-11 py-3"
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-[var(--border)] hover:border-brand-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
            </button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
                        <X className="w-3 h-3" /> Clear all
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Category</label>
                      <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="input-field text-sm py-2">
                        {categories.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Type</label>
                      <select value={filters.type} onChange={e => updateFilter('type', e.target.value)} className="input-field text-sm py-2">
                        {types.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-slate-500">Level</label>
                      <select value={filters.experienceLevel} onChange={e => updateFilter('experienceLevel', e.target.value)} className="input-field text-sm py-2">
                        {levels.map(l => <option key={l} value={l}>{l || 'All Levels'}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={filters.isRemote === 'true'} onChange={e => updateFilter('isRemote', e.target.checked ? 'true' : '')}
                          className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-sm">Remote only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            ) : internships.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No internships found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              internships.map((internship, i) => (
                <motion.div
                  key={internship._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <InternshipCard
                    internship={internship}
                    isSaved={savedIds.has(internship._id)}
                    onSave={toggleSave}
                    showSave={!!user}
                  />
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateFilter('page', filters.page - 1)}
                disabled={filters.page <= 1}
                className="btn-ghost px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-500">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => updateFilter('page', filters.page + 1)}
                disabled={filters.page >= pagination.pages}
                className="btn-ghost px-3 py-2 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function InternshipCard({ internship, isSaved, onSave, showSave }) {
  const deadline = new Date(internship.applicationDeadline)
  const isExpired = deadline < new Date()

  return (
    <Link to={`/internships/${internship._id}`}>
      <div className="glass-card p-5 card-hover h-full flex flex-col group">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {internship.company?.logo ? (
              <img src={internship.company.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-snug mb-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {internship.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              {internship.company?.name}
              {internship.company?.isVerified && <span className="text-brand-500">✓</span>}
            </p>
          </div>
          {showSave && (
            <button onClick={(e) => onSave(internship._id, e)} className="flex-shrink-0 text-slate-400 hover:text-brand-500 transition-colors p-1">
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-brand-500" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-medium">
            {internship.category}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
            {internship.type}
          </span>
          {internship.isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
              ⭐ Featured
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
          {internship.description}
        </p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {internship.location?.isRemote ? 'Remote' : internship.location?.city || 'N/A'}
          </div>
          <div className="flex items-center gap-1 justify-end">
            <DollarSign className="w-3 h-3" />
            <span className={internship.stipend?.isPaid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
              {internship.stipend?.isPaid ? `$${internship.stipend.min?.toLocaleString()}/mo` : 'Unpaid'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {internship.duration}
          </div>
          <div className={`flex items-center gap-1 justify-end text-xs ${isExpired ? 'text-rose-500' : ''}`}>
            {isExpired ? 'Expired' : `Closes ${formatDistanceToNow(deadline, { addSuffix: true })}`}
          </div>
        </div>
      </div>
    </Link>
  )
}
