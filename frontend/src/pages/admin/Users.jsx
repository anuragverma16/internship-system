import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Shield, Trash2, ToggleLeft, ToggleRight, UserCheck, Building2, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = () => {
    setLoading(true)
    const params = { page, limit: 15 }
    if (search) params.search = search
    if (roleFilter) params.role = roleFilter
    adminAPI.getUsers(params)
      .then(r => { setUsers(r.data.data); setPagination(r.data.pagination) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 400)
    return () => clearTimeout(t)
  }, [search])

  const toggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.data.isActive } : u))
      toast.success(res.data.message)
    } catch (err) { toast.error(err.message || 'Failed') }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return
    try {
      await adminAPI.deleteUser(id)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(err.message || 'Failed to delete') }
  }

  const roleIcon = { student: GraduationCap, company: Building2, admin: Shield }
  const roleColors = { student: 'text-brand-500', company: 'text-violet-500', admin: 'text-amber-500' }

  return (
    <DashboardLayout title="User Management">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Manage <span className="gradient-text">Users</span></h2>
        <p className="text-slate-500 dark:text-slate-400">{pagination.total || 0} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email..." className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {['', 'student', 'company', 'admin'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${roleFilter === r ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-8 shimmer rounded" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-500">No users found</td></tr>
              ) : users.map((u, i) => {
                const RoleIcon = roleIcon[u.role] || Users
                return (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className={`flex items-center gap-1.5 ${roleColors[u.role]}`}>
                        <RoleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{u.role}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-sm text-slate-500">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => toggleUser(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}
                              className="btn-ghost px-2 py-1.5 text-slate-500 hover:text-brand-600"
                            >
                              {u.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                            </button>
                            <button onClick={() => deleteUser(u._id, u.name)} title="Delete user"
                              className="btn-ghost px-2 py-1.5 text-slate-500 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {u.role === 'admin' && <span className="text-xs text-slate-400 pr-2">Protected</span>}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-ghost px-3 py-2 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
