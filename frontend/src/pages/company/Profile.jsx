import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Save, Upload, Globe, Linkedin, Twitter } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { companyAPI, uploadAPI } from '../../services/api'
import toast from 'react-hot-toast'

const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Media', 'Manufacturing', 'Consulting', 'Startup', 'Other']
const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function CompanyProfile() {
  const [form, setForm] = useState({ name: '', industry: 'Technology', size: '1-10', description: '', location: '', website: '', linkedIn: '', twitter: '', email: '', phone: '', founded: '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    companyAPI.getMe().then(r => {
      const c = r.data.data
      setForm({ name: c.name || '', industry: c.industry || 'Technology', size: c.size || '1-10', description: c.description || '', location: c.location || '', website: c.website || '', linkedIn: c.linkedIn || '', twitter: c.twitter || '', email: c.email || '', phone: c.phone || '', founded: c.founded || '' })
      setLogo(c.logo)
    }).catch(() => {})
  }, [])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const uploadLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAPI.logo(file)
      setLogo(res.data.data.path)
      toast.success('Logo uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const save = async () => {
    setLoading(true)
    try {
      await companyAPI.updateMe(form)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <DashboardLayout title="Company Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Logo + basic */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-brand-500" /> Company Identity</h3>
          <div className="flex items-start gap-6 mb-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-slate-400" />}
              </div>
              <label className={`text-xs cursor-pointer text-brand-600 dark:text-brand-400 hover:underline ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? 'Uploading...' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">Company Name *</label>
                <input name="name" value={form.name} onChange={onChange} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-slate-500">Industry</label>
                  <select name="industry" value={form.industry} onChange={onChange} className="input-field">
                    {industries.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-slate-500">Company Size</label>
                  <select name="size" value={form.size} onChange={onChange} className="input-field">
                    {sizes.map(s => <option key={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-slate-500">About the Company</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4} placeholder="Tell students about your company, culture, and mission..." className="input-field resize-none" />
          </div>
        </motion.div>

        {/* Contact & Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Contact & Location</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'location', label: 'Headquarters', placeholder: 'San Francisco, CA' },
              { name: 'founded', label: 'Founded Year', placeholder: '2010', type: 'number' },
              { name: 'email', label: 'Contact Email', placeholder: 'hr@company.com', type: 'email' },
              { name: 'phone', label: 'Contact Phone', placeholder: '+1 234 567 8900' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">{field.label}</label>
                <input name={field.name} type={field.type || 'text'} value={form[field.name]} onChange={onChange} placeholder={field.placeholder} className="input-field" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Online Presence</h3>
          <div className="space-y-3">
            {[
              { name: 'website', label: 'Website', placeholder: 'https://company.com', icon: Globe },
              { name: 'linkedIn', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...', icon: Linkedin },
              { name: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...', icon: Twitter },
            ].map(link => (
              <div key={link.name}>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">{link.label}</label>
                <div className="relative">
                  <link.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name={link.name} value={form[link.name]} onChange={onChange} placeholder={link.placeholder} className="input-field pl-10" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <button onClick={save} disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span> : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>
    </DashboardLayout>
  )
}
