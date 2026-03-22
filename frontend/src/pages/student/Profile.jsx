import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Upload, Save, Plus, Trash2, GraduationCap, Briefcase, Link as LinkIcon, FileText } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { userAPI, uploadAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const skillSuggestions = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL', 'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Marketing', 'Excel', 'TypeScript', 'AWS', 'Docker', 'Git']

export default function StudentProfile() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const [form, setForm] = useState({
    university: '', major: '', graduationYear: '', gpa: '',
    skills: [], bio: '', linkedIn: '', github: '', portfolio: '',
    location: '', phone: '', experience: [], education: []
  })

  useEffect(() => {
    if (user?.studentProfile) {
      const p = user.studentProfile
      setForm({
        university: p.university || '',
        major: p.major || '',
        graduationYear: p.graduationYear || '',
        gpa: p.gpa || '',
        skills: p.skills || [],
        bio: p.bio || '',
        linkedIn: p.linkedIn || '',
        github: p.github || '',
        portfolio: p.portfolio || '',
        location: p.location || '',
        phone: p.phone || '',
        experience: p.experience || [],
        education: p.education || []
      })
    }
  }, [user])

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addSkill = (skill) => {
    const s = (skill || skillInput).trim()
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }))
    }
    setSkillInput('')
  }

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))

  const uploadResume = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAPI.resume(file)
      updateUser({ studentProfile: { ...user.studentProfile, resume: res.data.data.path, resumeOriginalName: res.data.data.originalName } })
      toast.success('Resume uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await userAPI.updateProfile(form)
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally { setLoading(false) }
  }

  const addExperience = () => {
    setForm(f => ({ ...f, experience: [...f.experience, { title: '', company: '', duration: '', description: '' }] }))
  }

  const updateExp = (i, field, val) => {
    setForm(f => {
      const exp = [...f.experience]
      exp[i] = { ...exp[i], [field]: val }
      return { ...f, experience: exp }
    })
  }

  const removeExp = (i) => setForm(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }))

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Avatar + Resume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-brand-500" /> Personal Info</h3>
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avatar</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">Full Name</label>
                <input value={user?.name || ''} disabled className="input-field opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">Email</label>
                <input value={user?.email || ''} disabled className="input-field opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="+1 234 567 8900" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">Location</label>
                <input name="location" value={form.location} onChange={onChange} placeholder="City, Country" className="input-field" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-1.5 text-slate-500">Bio</label>
            <textarea name="bio" value={form.bio} onChange={onChange} rows={3}
              placeholder="Tell companies about yourself, your interests and goals..."
              className="input-field resize-none"
            />
          </div>
        </motion.div>

        {/* Education */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-brand-500" /> Education</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-500">University</label>
              <input name="university" value={form.university} onChange={onChange} placeholder="MIT, Stanford..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-500">Major</label>
              <input name="major" value={form.major} onChange={onChange} placeholder="Computer Science" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-500">Graduation Year</label>
              <input name="graduationYear" type="number" value={form.graduationYear} onChange={onChange} placeholder="2025" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-500">GPA (optional)</label>
              <input name="gpa" type="number" step="0.1" min="0" max="4" value={form.gpa} onChange={onChange} placeholder="3.8" className="input-field" />
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-3 min-h-10">
            {form.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-sm font-medium">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter"
              className="input-field flex-1"
            />
            <button onClick={() => addSkill()} className="btn-secondary text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillSuggestions.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
              <button key={s} onClick={() => addSkill(s)} className="px-3 py-1 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-brand-400 hover:text-brand-500 text-xs transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-brand-500" /> Resume</h3>
          {user?.studentProfile?.resume ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{user.studentProfile.resumeOriginalName || 'resume.pdf'}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Uploaded successfully</p>
                </div>
              </div>
              <label className="btn-secondary text-xs cursor-pointer">
                Update
                <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} className="hidden" />
              </label>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-brand-300 bg-brand-50 dark:bg-brand-950/20' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20'}`}>
              {uploading ? (
                <span className="flex items-center gap-2 text-brand-600">
                  <span className="w-5 h-5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="font-semibold text-sm mb-0.5">Upload Resume</p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX — max 5MB</p>
                </>
              )}
              <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} className="hidden" disabled={uploading} />
            </label>
          )}
        </motion.div>

        {/* Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-brand-500" /> Social Links</h3>
          <div className="space-y-3">
            {[
              { name: 'linkedIn', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourname' },
              { name: 'github', label: 'GitHub URL', placeholder: 'https://github.com/yourname' },
              { name: 'portfolio', label: 'Portfolio / Website', placeholder: 'https://yourportfolio.com' },
            ].map(link => (
              <div key={link.name}>
                <label className="block text-xs font-medium mb-1.5 text-slate-500">{link.label}</label>
                <input name={link.name} value={form[link.name]} onChange={onChange} placeholder={link.placeholder} className="input-field" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-500" /> Experience</h3>
            <button onClick={addExperience} className="btn-secondary text-xs"><Plus className="w-3 h-3" /> Add</button>
          </div>
          {form.experience.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No experience added yet</p>
          ) : (
            <div className="space-y-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-slate-500">Experience #{i + 1}</span>
                    <button onClick={() => removeExp(i)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Job Title" className="input-field text-sm py-2" />
                    <input value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Company" className="input-field text-sm py-2" />
                    <input value={exp.duration} onChange={e => updateExp(i, 'duration', e.target.value)} placeholder="e.g. Jun 2023 - Aug 2023" className="input-field text-sm py-2 col-span-2" />
                    <textarea value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Brief description..." rows={2} className="input-field text-sm py-2 resize-none col-span-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Save button */}
        <button onClick={saveProfile} disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <><Save className="w-4 h-4" /> Save Profile</>
          )}
        </button>
      </div>
    </DashboardLayout>
  )
}
