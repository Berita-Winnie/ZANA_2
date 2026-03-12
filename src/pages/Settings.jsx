import { useEffect, useState } from 'react'
import Layout from '../components/layout'
import { apiRequest } from '../lib/api'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Settings() {
  const [orgName, setOrgName] = useState('')
  const [resourceCategories, setResourceCategories] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const { addToast } = useToast()

  const [admins, setAdmins] = useState([])
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, usersData] = await Promise.all([
          apiRequest('/settings/general'),
          apiRequest('/users'),
        ])

        setOrgName(settingsData.organizationName || '')
        setResourceCategories((settingsData.resourceCategories || []).join(', '))
        setAdmins(usersData.filter((user) => user.role === 'superAdmin'))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load settings', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSaving(true)
    try {
      const payload = {
        organizationName: orgName,
        resourceCategories: resourceCategories
          ? resourceCategories.split(',').map((c) => c.trim())
          : [],
      }
      await apiRequest('/settings/general', {
        method: 'PUT',
        body: payload,
      })
      setFormSuccess('Settings updated successfully.')
      addToast('Settings updated successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to save settings.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const seedDemoData = async () => {
    setSeeding(true)
    setFormError('')
    setFormSuccess('')
    try {
      await apiRequest('/settings/seed', { method: 'POST' })
      setFormSuccess('Demo data seeded successfully.')
      addToast('Demo data seeded successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to seed demo data.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure organization details, admins, and resource categories.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading settings...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Organization settings
                </h2>
                <FormFeedback error={formError} success={formSuccess} className="mb-2" />
                <form onSubmit={handleSave} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Organization name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Resource categories (comma separated)
                    </label>
                    <input
                      type="text"
                      value={resourceCategories}
                      onChange={(e) => setResourceCategories(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Example: sanitary pads, underwear, educational materials
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#253290] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#1b2568] disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save settings'}
                  </button>
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={seedDemoData}
                    className="ml-3 border border-[#253290] text-[#253290] text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#eef2ff] disabled:opacity-60"
                  >
                    {seeding ? 'Seeding demo data...' : 'Seed demo data'}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Admin users
                </h2>
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No admin users listed yet.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {admins.map((user) => (
                      <li
                        key={user.id}
                        className="flex justify-between border-b border-gray-100 last:border-none pb-1.5 last:pb-0"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullName || user.email || 'Admin'}
                          </p>
                          {user.email && (
                            <p className="text-[11px] text-gray-500">
                              {user.email}
                            </p>
                          )}
                        </div>
                        {user.role && (
                          <span className="text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                            {user.role}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Settings

