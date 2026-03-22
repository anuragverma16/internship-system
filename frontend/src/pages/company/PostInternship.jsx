import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, X } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { internshipAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Software Engineering','Data Science','Design','Marketing',
  'Finance','Business','Research','Sales','Operations','HR','Legal','Other',
]
const TYPES    = ['Full-time','Part-time','Remote','Hybrid','On-site']
const LEVELS   = ['Fresher','Beginner','Intermediate','Advanced']
const PERKS    = [
  'Mentorship','Certificate','Pre-Placement Offer','Flexible Hours',
  'Work from Home','Stipend','Healthcare','Free Meals','Team Outings','Learning Budget',
]

const INIT = {
  title:'', description:'', requirements:'', responsibilities:'',
  category:'Software Engineering', type:'Full-time', duration:'',
  experienceLevel:'Fresher', openings:1,
  stipend:{ min:0, max:0, currency:'USD', isPaid:true },
  location:{ city:'', country:'', isRemote:false },
  applicationDeadline:'', startDate:'',
  skills:[], perks:[], status:'active',
}

/* ─── tiny helpers defined at module level (never remount) ──────── */
function SectionBox({ title, children }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-bold text-base border-b border-[var(--border)] pb-3">{title}</h3>
      {children}
    </div>
  )
}

function FieldBox({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-slate-500 select-none">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ─── auto-resize textarea that NEVER causes page scroll ─────────── */
function AutoTextarea({ value, onChange, name, placeholder, minRows = 4 }) {
  const ref = useRef(null)

  /* resize textarea height to fit content without touching page scroll */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const scrollY = el.closest('main')?.scrollTop ?? 0   // save scroll pos
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    if (el.closest('main')) el.closest('main').scrollTop = scrollY  // restore
  }, [value])

  return (
    <textarea
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      style={{ minHeight: minRows * 24 + 'px', overflow: 'hidden' }}
      className="input-field resize-none w-full"
    />
  )
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function PostInternship() {
  const { id }    = useParams()
  const isEdit    = !!id
  const navigate  = useNavigate()
  const [form, setForm]           = useState(INIT)
  const [loading, setLoading]     = useState(false)
  const [skillInput, setSkill]    = useState('')

  /* load data when editing */
  useEffect(() => {
    if (!isEdit) return
    internshipAPI.getOne(id).then(r => {
      const d = r.data.data
      setForm({
        title: d.title || '',
        description: d.description || '',
        requirements: d.requirements || '',
        responsibilities: d.responsibilities || '',
        category: d.category || 'Software Engineering',
        type: d.type || 'Full-time',
        duration: d.duration || '',
        experienceLevel: d.experienceLevel || 'Fresher',
        openings: d.openings || 1,
        stipend: d.stipend || INIT.stipend,
        location: d.location || INIT.location,
        applicationDeadline: d.applicationDeadline?.split('T')[0] || '',
        startDate: d.startDate?.split('T')[0] || '',
        skills: d.skills || [],
        perks: d.perks || [],
        status: d.status || 'active',
      })
    }).catch(() => toast.error('Failed to load'))
  }, [id, isEdit])

  /* stable handlers — useCallback so children never get new refs */
  const set = useCallback((name, value) =>
    setForm(p => ({ ...p, [name]: value })), [])

  const setNested = useCallback((parent, key, value) =>
    setForm(p => ({ ...p, [parent]: { ...p[parent], [key]: value } })), [])

  const onChange = useCallback(e => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
  }, [set])

  const addSkill = useCallback(() => {
    const s = skillInput.trim()
    if (s) setForm(p => p.skills.includes(s) ? p : { ...p, skills: [...p.skills, s] })
    setSkill('')
  }, [skillInput])

  const removeSkill = useCallback(s =>
    setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) })), [])

  const togglePerk = useCallback(perk =>
    setForm(p => ({
      ...p,
      perks: p.perks.includes(perk) ? p.perks.filter(x => x !== perk) : [...p.perks, perk],
    })), [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.description || !form.duration || !form.applicationDeadline) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      if (isEdit) { await internshipAPI.update(id, form); toast.success('Updated!') }
      else         { await internshipAPI.create(form);      toast.success('Posted!')  }
      navigate('/company/internships')
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout title={isEdit ? 'Edit Internship' : 'Post Internship'}>
      <div className="max-w-3xl mx-auto pb-10">

        {/* heading */}
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost px-3 py-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              {isEdit ? 'Edit' : 'Post New'} <span className="gradient-text">Internship</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in the details to attract top talent</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <SectionBox title="Basic Information">
            <FieldBox label="Internship Title" required>
              <input
                name="title" value={form.title} onChange={onChange}
                placeholder="e.g. Frontend Developer Intern"
                className="input-field" autoComplete="off"
              />
            </FieldBox>

            <div className="grid grid-cols-2 gap-4">
              <FieldBox label="Category" required>
                <select name="category" value={form.category} onChange={onChange} className="input-field">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </FieldBox>

              <FieldBox label="Type" required>
                <select name="type" value={form.type} onChange={onChange} className="input-field">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </FieldBox>

              <FieldBox label="Duration" required>
                <input
                  name="duration" value={form.duration} onChange={onChange}
                  placeholder="e.g. 3 months" className="input-field" autoComplete="off"
                />
              </FieldBox>

              <FieldBox label="Openings">
                <input
                  name="openings" type="number" min="1"
                  value={form.openings} onChange={onChange} className="input-field"
                />
              </FieldBox>

              <FieldBox label="Experience Level">
                <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="input-field">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </FieldBox>

              <FieldBox label="Status">
                <select name="status" value={form.status} onChange={onChange} className="input-field">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </FieldBox>
            </div>
          </SectionBox>

          {/* Description */}
          <SectionBox title="Description & Requirements">
            <FieldBox label="Description" required>
              <AutoTextarea
                name="description" value={form.description} onChange={onChange} minRows={5}
                placeholder="Describe the internship role, team, and what the intern will work on..."
              />
            </FieldBox>
            <FieldBox label="Responsibilities">
              <AutoTextarea
                name="responsibilities" value={form.responsibilities} onChange={onChange} minRows={4}
                placeholder="List the key responsibilities..."
              />
            </FieldBox>
            <FieldBox label="Requirements">
              <AutoTextarea
                name="requirements" value={form.requirements} onChange={onChange} minRows={4}
                placeholder="List the requirements, qualifications, skills needed..."
              />
            </FieldBox>
          </SectionBox>

          {/* Skills */}
          <SectionBox title="Skills Required">
            <div className="flex flex-wrap gap-2 min-h-8 mb-3">
              {form.skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-sm">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={e => setSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Add a skill (press Enter)"
                className="input-field flex-1" autoComplete="off"
              />
              <button type="button" onClick={addSkill} className="btn-secondary text-sm">Add</button>
            </div>
          </SectionBox>

          {/* Compensation */}
          <SectionBox title="Compensation">
            <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
              <input
                type="checkbox" checked={form.stipend.isPaid}
                onChange={e => setNested('stipend', 'isPaid', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm font-medium">Paid Internship</span>
            </label>

            {form.stipend.isPaid && (
              <div className="grid grid-cols-3 gap-4">
                <FieldBox label="Min Stipend ($/mo)">
                  <input type="text" min="" value={form.stipend.min}
                    onChange={e => setNested('stipend', 'min', parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </FieldBox>
                <FieldBox label="Max Stipend ($/mo)">
                  <input type="text" min="" value={form.stipend.max}
                    onChange={e => setNested('stipend', 'max', parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </FieldBox>
                <FieldBox label="Currency">
                  <select value={form.stipend.currency}
                    onChange={e => setNested('stipend', 'currency', e.target.value)}
                    className="input-field"
                  >
                    {['USD','EUR','GBP','INR','CAD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </FieldBox>
              </div>
            )}
          </SectionBox>

          {/* Location */}
          <SectionBox title="Location">
            <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
              <input
                type="checkbox" checked={form.location.isRemote}
                onChange={e => setNested('location', 'isRemote', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm font-medium">Remote / Work from home</span>
            </label>

            {!form.location.isRemote && (
              <div className="grid grid-cols-2 gap-4">
                <FieldBox label="City">
                  <input value={form.location.city}
                    onChange={e => setNested('location', 'city', e.target.value)}
                    placeholder="San Francisco" className="input-field" autoComplete="off"
                  />
                </FieldBox>
                <FieldBox label="Country">
                  <input value={form.location.country}
                    onChange={e => setNested('location', 'country', e.target.value)}
                    placeholder="United States" className="input-field" autoComplete="off"
                  />
                </FieldBox>
              </div>
            )}
          </SectionBox>

          {/* Timeline */}
          <SectionBox title="Timeline">
            <div className="grid grid-cols-2 gap-4">
              <FieldBox label="Application Deadline" required>
                <input type="date" value={form.applicationDeadline}
                  onChange={e => set('applicationDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </FieldBox>
              <FieldBox label="Start Date">
                <input type="date" value={form.startDate}
                  onChange={e => set('startDate', e.target.value)}
                  className="input-field"
                />
              </FieldBox>
            </div>
          </SectionBox>

          {/* Perks */}
          <SectionBox title="Perks & Benefits">
            <div className="flex flex-wrap gap-2">
              {PERKS.map(perk => (
                <button key={perk} type="button" onClick={() => togglePerk(perk)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.perks.includes(perk)
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {perk}
                </button>
              ))}
            </div>
          </SectionBox>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                : <><Save className="w-4 h-4" />{isEdit ? 'Update' : 'Post'} Internship</>
              }
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  )
}
