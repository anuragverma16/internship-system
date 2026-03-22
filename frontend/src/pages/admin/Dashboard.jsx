import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Briefcase, FileText, TrendingUp, Activity, Star, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const COLORS = ['#5462ff', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#64748b']

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getAnalytics().then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <DashboardLayout title="Analytics Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-5 h-28 shimmer" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-5 h-64 shimmer" />)}
      </div>
    </DashboardLayout>
  )

  const overview = data?.overview || {}
  const appsByStatus = data?.applicationsByStatus || []
  const byCategory = data?.internshipsByCategory || []
  const monthly = (data?.monthlyApplications || []).map(m => ({
    name: months[(m._id.month || 1) - 1],
    Applications: m.count
  }))

  const pieData = appsByStatus.map(s => ({ name: s._id, value: s.count }))
  const categoryData = byCategory.map(c => ({ name: c._id, count: c.count }))

  const stats = [
    { label: 'Total Students', value: overview.totalStudents || 0, icon: Users, color: 'text-brand-500', change: '+12%' },
    { label: 'Companies', value: overview.totalCompanies || 0, icon: Building2, color: 'text-violet-500', change: '+8%' },
    { label: 'Internships', value: overview.totalInternships || 0, icon: Briefcase, color: 'text-cyan-500', change: '+24%' },
    { label: 'Applications', value: overview.totalApplications || 0, icon: FileText, color: 'text-amber-500', change: '+18%' },
  ]

  return (
    <DashboardLayout title="Analytics Dashboard">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold mb-0.5">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active internships highlight */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card p-5 mb-6 flex items-center gap-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg">{overview.activeInternships || 0} Active Internships</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Currently accepting applications on the platform</p>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
        </div>
      </motion.div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly applications line chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="font-bold text-base mb-4">Monthly Applications</h3>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="Applications" stroke="#5462ff" strokeWidth={2.5} dot={{ fill: '#5462ff', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data available yet</div>
          )}
        </motion.div>

        {/* Application status pie chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h3 className="font-bold text-base mb-4">Application Status Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs capitalize">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data available yet</div>
          )}
        </motion.div>

        {/* Categories bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="font-bold text-base mb-4">Internships by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#5462ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data available yet</div>
          )}
        </motion.div>

        {/* Recent users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-5">
          <h3 className="font-bold text-base mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {(data?.recentUsers || []).length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No recent users</p>
            ) : (data?.recentUsers || []).map((u, i) => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    u.role === 'student' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400' :
                    u.role === 'company' ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400' :
                    'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                  }`}>{u.role}</span>
                  <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
