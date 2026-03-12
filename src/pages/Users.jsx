import { useEffect, useState } from 'react'
import Layout from '../components/layout'
import { apiRequest } from '../lib/api'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await apiRequest('/users')
        setUsers(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const updateRole = async (id, role) => {
    setFormError('')
    setFormSuccess('')
    try {
      const updated = await apiRequest(`/users/${id}`, {
        method: 'PATCH',
        body: { role },
      })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
      setFormSuccess('User role updated successfully.')
      addToast('User role updated successfully.', 'success')
    } catch (error) {
      const msg = error.message || 'Failed to update role.'
      setFormError(msg)
      addToast(msg, 'error')
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">
          Manage user access and role permissions.
        </p>
        <FormFeedback error={formError} success={formSuccess} />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-3 py-2">{u.fullName}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                        >
                          <option value="superAdmin">superAdmin</option>
                          <option value="fieldOfficer">fieldOfficer</option>
                          <option value="donor">donor</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Users

