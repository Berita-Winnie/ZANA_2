import { useEffect, useState } from 'react'
import Layout from '../components/layout'
import { apiRequest } from '../lib/api'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Donors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
  })

  useEffect(() => {
    const loadDonors = async () => {
      try {
        const data = await apiRequest('/donors')
        setDonors(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load donors', error)
      } finally {
        setLoading(false)
      }
    }
    loadDonors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSaving(true)
    try {
      const created = await apiRequest('/donors', {
        method: 'POST',
        body: form,
      })
      setDonors((prev) => [created, ...prev])
      setForm({ name: '', email: '', organization: '' })
      setFormSuccess('Donor saved successfully.')
      addToast('Donor saved successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to create donor.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Donors</h1>
        <p className="text-sm text-gray-500">
          Manage donor profiles and funded project relationships.
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Add donor</h2>
            <FormFeedback error={formError} success={formSuccess} className="mb-2" />
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                placeholder="Email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={form.organization}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, organization: e.target.value }))
                }
                placeholder="Organization"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#253290] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#1b2568] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save donor'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Donor list</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Loading donors...</p>
            ) : donors.length === 0 ? (
              <p className="text-sm text-gray-500">No donors added yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {donors.map((donor) => (
                  <div key={donor.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-sm text-gray-900">{donor.name}</p>
                    <p className="text-xs text-gray-500">{donor.email}</p>
                    {donor.organization && (
                      <p className="text-xs text-gray-500 mt-1">{donor.organization}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Donors

