import { useEffect, useState } from 'react'
import Layout from '../components/layout'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext.jsx'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Schools() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const { addToast } = useToast()
  const { role } = useAuth()
  const canCreate = role === 'superAdmin' || role === 'fieldOfficer'
  const [form, setForm] = useState({
    name: '',
    location: '',
    girlsCount: '',
  })

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await apiRequest('/schools')
        setSchools(schoolsData)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load schools', error)
      } finally {
        setLoading(false)
      }
    }
    loadSchools()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        location: form.location,
        girlsCount: Number(form.girlsCount) || 0,
      }
      const created = await apiRequest('/schools', {
        method: 'POST',
        body: payload,
      })
      setSchools((prev) => [...prev, created])
      setForm({ name: '', location: '', girlsCount: '' })
      setFormSuccess('School saved successfully.')
      addToast('School saved successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to save school.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schools</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage partner schools and track girls reached.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {canCreate && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Add school
                </h2>
                <FormFeedback error={formError} success={formSuccess} className="mb-2" />
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      School name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
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
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Number of girls
                    </label>
                    <input
                      type="number"
                      name="girlsCount"
                      value={form.girlsCount}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#253290] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#1b2568] disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save school'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                Partner schools
              </h2>
              {loading ? (
                <p className="text-sm text-gray-500">Loading schools...</p>
              ) : schools.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No schools yet. Add your first partner school.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {schools.map((s) => (
                    <div
                      key={s.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <p className="font-medium text-sm text-gray-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">{s.location}</p>
                      {typeof s.girlsCount === 'number' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {s.girlsCount} girls
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Schools

