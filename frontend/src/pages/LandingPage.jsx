import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Briefcase, Users, Building2, Star, ChevronDown, Zap, Shield, Globe, TrendingUp, Search, MapPin } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { internshipAPI } from '../services/api'

const stats = [
  { label: 'Active Internships', value: '5+', icon: Briefcase, color: 'text-brand-500' },
  { label: 'Companies Hiring', value: '5+', icon: Building2, color: 'text-accent-violet' },
  { label: 'Students Placed', value: '5+', icon: Users, color: 'text-accent-cyan' },
  { label: 'Success Rate', value: '100%', icon: Star, color: 'text-accent-amber' },
]

const features = [
  { icon: Zap, title: 'Instant Matching', desc: 'AI-powered matching connects you with internships that fit your skills and interests perfectly.', color: 'from-amber-400 to-orange-500' },
  { icon: Shield, title: 'Verified Companies', desc: 'Every company is verified by our team. Apply with confidence, knowing every listing is legitimate.', color: 'from-brand-400 to-brand-600' },
  { icon: Globe, title: 'Remote & Global', desc: 'Explore opportunities worldwide — remote, hybrid, or on-site. Your dream internship has no borders.', color: 'from-cyan-400 to-blue-500' },
  { icon: TrendingUp, title: 'Career Growth', desc: 'Track applications, get feedback, and grow your career with actionable insights and analytics.', color: 'from-violet-400 to-purple-600' },
]

const categories = ['Software Engineering', 'Data Science', 'Design', 'Marketing', 'Finance', 'Business', 'Research', 'Sales']

const testimonials = [
  { name: 'Priya Sharma', role: 'SWE Intern @ Google', avatar: 'PS', text: 'InternHub helped me land my dream internship at Google. The process was seamless and the platform is incredibly easy to use!', rating: 5 },
  { name: 'Alex Chen', role: 'Design Intern @ Figma', avatar: 'AC', text: 'Found multiple great opportunities. The filters are amazing and company profiles gave me confidence in every application.', rating: 5 },
  { name: 'Marcus Williams', role: 'Finance Intern @ JPMorgan', avatar: 'MW', text: 'The application tracking dashboard is a game-changer. I always knew exactly where I stood with each application.', rating: 5 },
]

const floatingBadges = [
  { text: '🚀 Just Posted', x: '10%', y: '20%', delay: 0 },
  { text: '💰 $2000/mo', x: '80%', y: '15%', delay: 0.5 },
  { text: '🌎 Remote OK', x: '75%', y: '65%', delay: 1 },
  { text: '⚡ Fast Apply', x: '5%', y: '70%', delay: 1.5 },
]

export default function LandingPage() {
  const [featured, setFeatured] = useState([])
  const [search, setSearch] = useState('')
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    internshipAPI.getFeatured().then(r => setFeatured(r.data.data || [])).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    window.location.href = `/internships?search=${search}`
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid dark:opacity-100 opacity-40" />
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Floating badges */}
        {floatingBadges.map((badge, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:block"
            style={{ left: badge.x, top: badge.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ delay: badge.delay + 1, duration: 0.5, y: { repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' } }}
          >
            <div className="glass-card px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-glass whitespace-nowrap">
              {badge.text}
            </div>
          </motion.div>
        ))}

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              5+ Active Internships Available
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            Launch Your{' '}
            <span className="gradient-text">Career</span>
            <br />
            with the Right{' '}
            <span className="gradient-text">Internship</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Connect with top companies, build real experience, and kickstart your professional journey. Thousands of internships waiting for you.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search internships, companies, skills..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base shadow-sm"
              />
            </div>
            <button type="submit" className="btn-primary py-4 px-8 text-base rounded-2xl whitespace-nowrap">
              Find Internships <ArrowRight className="w-5 h-5" />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">Popular:</span>
            {categories.slice(0, 5).map(cat => (
              <Link key={cat} to={`/internships?category=${cat}`}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, y: { repeat: Infinity, duration: 2 } }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-600"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center card-hover"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-slate-50 dark:bg-[var(--bg-secondary)]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="section-heading mb-3">Featured <span className="gradient-text">Opportunities</span></h2>
              <p className="text-slate-500 dark:text-slate-400">Hand-picked internships from top companies</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featured.slice(0, 6).map((internship, i) => (
                <motion.div
                  key={internship._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <InternshipCard internship={internship} />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/internships" className="btn-primary text-base px-8 py-3">
                Browse All Internships <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading mb-4">Everything you need to <span className="gradient-text">succeed</span></h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              InternHub provides the tools, connections, and insights to make your internship search effortless.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 card-hover flex gap-5"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-heading mb-3">Loved by <span className="gradient-text">Students</span></h2>
            <p className="text-slate-500 dark:text-slate-400">Real stories from students who found their dream internships</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-violet-600" />
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute inset-0 noise-overlay" />
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students who have already launched their careers with InternHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register?role=student"
                  className="px-8 py-4 rounded-2xl bg-white text-brand-600 font-bold hover:bg-brand-50 transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register?role=company"
                  className="px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-bold hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  Post Internships <Building2 className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function InternshipCard({ internship }) {
  return (
    <Link to={`/internships/${internship._id}`} className="block">
      <div className="glass-card p-5 card-hover h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {internship.company?.logo ? (
              <img src={internship.company.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-brand-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight line-clamp-1">{internship.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{internship.company?.name}</p>
          </div>
          {internship.isFeatured && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex-shrink-0">Featured</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-xs font-medium">{internship.category}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">{internship.type}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {internship.location?.isRemote ? 'Remote' : internship.location?.city || 'N/A'}
          </div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            {internship.stipend?.isPaid ? `$${internship.stipend.min?.toLocaleString()}/mo` : 'Unpaid'}
          </div>
        </div>
      </div>
    </Link>
  )
}
