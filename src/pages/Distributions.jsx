import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Distributions() {
  const [schools, setSchools] = useState([])
  const [projects, setProjects] = useState([])
  const [distributions, setDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [filters, setFilters] = useState({
    schoolId: '',
    projectId: '',
    resourceType: '',
    startDate: '',
    endDate: '',
  })

  const [form, setForm] = useState({
    schoolId: '',
    projectId: '',
    resourceType: '',
    quantity: '',
    girlsImpacted: '',
    date: '',
    location: '',
    notes: '',
  })

  const { profile, role } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [schoolsData, projectsData, distributionsData] = await Promise.all([
          apiRequest('/schools'),
          apiRequest('/projects'),
          apiRequest('/distributions'),
        ])
        setSchools(schoolsData)
        setProjects(projectsData)
        setDistributions(distributionsData)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load distributions data', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.projectId || !form.schoolId) {
      const msg = 'Please select both project and school before submitting.'
      setFormError(msg)
      addToast(msg, 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        schoolId: form.schoolId || null,
        projectId: form.projectId || null,
        resourceType: form.resourceType,
        quantity: Number(form.quantity) || 0,
        girlsImpacted: Number(form.girlsImpacted) || 0,
        date: form.date || new Date().toISOString().slice(0, 10),
        location: form.location || '',
        notes: form.notes || '',
        submittedBy: profile?.uid || null,
        approvalStatus: 'pending',
      }

      const created = await apiRequest('/distributions', {
        method: 'POST',
        body: payload,
      })
      setDistributions((prev) => [created, ...prev])
      setForm({
        schoolId: '',
        projectId: '',
        resourceType: '',
        quantity: '',
        girlsImpacted: '',
        date: '',
        location: '',
        notes: '',
      })
      setFormSuccess('Distribution submitted successfully and marked as pending.')
      addToast('Distribution submitted successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to save distribution.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }
  const roleScopedDistributions = useMemo(() => {
    if (role === 'superAdmin') return distributions
    if (role === 'fieldOfficer') {
      if (!profile?.uid) return []
      const assigned = profile.assignedProjects || []
      return distributions.filter(
        (d) =>
          d.submittedBy === profile.uid ||
          (assigned.length && assigned.includes(d.projectId)),
      )
    }
    return []
  }, [distributions, role, profile])

  const filteredDistributions = roleScopedDistributions.filter((d) => {
    if (filters.schoolId && d.schoolId !== filters.schoolId) return false
    if (filters.projectId && d.projectId !== filters.projectId) return false
    if (
      filters.resourceType &&
      !d.resourceType?.toLowerCase().includes(filters.resourceType.toLowerCase())
    ) {
      return false
    }
    if (filters.startDate || filters.endDate) {
      const raw =
        typeof d.date === 'string'
          ? d.date
          : d.date?.toDate
            ? d.date.toDate().toISOString().slice(0, 10)
            : ''
      if (!raw) return false
      if (filters.startDate && raw < filters.startDate) return false
      if (filters.endDate && raw > filters.endDate) return false
    }
    return true
  })

  const exportCsv = () => {
    if (filteredDistributions.length === 0) return

    const header = [
      'date',
      'school',
      'project',
      'resourceType',
      'quantity',
      'girlsImpacted',
    ]

    const rows = filteredDistributions.map((d) => {
      const school = schools.find((s) => s.id === d.schoolId)
      const project = projects.find((p) => p.id === d.projectId)
      const rawDate =
        typeof d.date === 'string'
          ? d.date
          : d.date?.toDate
            ? d.date.toDate().toISOString().slice(0, 10)
            : ''

      return [
        rawDate,
        school?.name || '',
        project?.name || '',
        d.resourceType || '',
        d.quantity ?? '',
        d.girlsImpacted ?? '',
      ]
    })

    const csvContent = [header, ...rows]
      .map((cols) =>
        cols
          .map((val) => {
            const str = String(val ?? '')
            if (str.includes(',') || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          })
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'distributions.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Distributions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {role === 'superAdmin'
                ? 'Track all distributions and review pending items in the review queue.'
                : 'Record and track resource distributions to schools.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {role === 'superAdmin' && (
              <Link
                to="/reviews"
                className="text-xs font-medium border border-[#253290] text-[#253290] rounded-full px-4 py-2 hover:bg-[#eef2ff]"
              >
                Open review queue
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                const formEl = document.getElementById('distribution-form')
                if (formEl) {
                  formEl.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="text-xs font-medium bg-[#253290] text-white rounded-full px-4 py-2 hover:bg-[#1b2568]"
            >
              + Quick add distribution
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {role !== 'donor' && (
            <div className="lg:col-span-1">
              <div
                id="distribution-form"
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Record new distribution
                </h2>
                <FormFeedback error={formError} success={formSuccess} />
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      School
                    </label>
                    <select
                      name="schoolId"
                      value={form.schoolId}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    >
                      <option value="">Select school</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Project
                    </label>
                    <select
                      name="projectId"
                      value={form.projectId}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    >
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Resource type
                    </label>
                    <input
                      type="text"
                      name="resourceType"
                      value={form.resourceType}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Girls impacted
                      </label>
                      <input
                        type="number"
                        name="girlsImpacted"
                        value={form.girlsImpacted}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#253290] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#1b2568] disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save distribution'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Recent distributions
                  </h2>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="text-[11px] border border-gray-300 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="grid gap-2 md:grid-cols-4 text-xs">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">
                      Filter by school
                    </label>
                    <select
                      name="schoolId"
                      value={filters.schoolId}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#253290]"
                    >
                      <option value="">All schools</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">
                      Filter by project
                    </label>
                    <select
                      name="projectId"
                      value={filters.projectId}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#253290]"
                    >
                      <option value="">All projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">
                      Resource type
                    </label>
                    <input
                      type="text"
                      name="resourceType"
                      value={filters.resourceType}
                      onChange={handleFilterChange}
                      placeholder="e.g. pads"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#253290]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#253290]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#253290]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-gray-500">Loading distributions...</p>
              ) : filteredDistributions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No distributions recorded yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          School
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Project
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Resource
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Quantity
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Girls impacted
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDistributions.map((d) => {
                        const school = schools.find((s) => s.id === d.schoolId)
                        const project = projects.find((p) => p.id === d.projectId)
                        return (
                          <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              {d.date
                                ? typeof d.date === 'string'
                                  ? d.date
                                  : d.date.toDate
                                    ? d.date.toDate().toLocaleDateString()
                                    : ''
                                : ''}
                            </td>
                            <td className="px-3 py-2">
                              {school?.name || '—'}
                            </td>
                            <td className="px-3 py-2">
                              {project?.name || '—'}
                            </td>
                            <td className="px-3 py-2">{d.resourceType}</td>
                            <td className="px-3 py-2 text-right">
                              {d.quantity}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {d.girlsImpacted}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                                  d.approvalStatus === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : d.approvalStatus === 'rejected'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {d.approvalStatus || 'pending'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Distributions
