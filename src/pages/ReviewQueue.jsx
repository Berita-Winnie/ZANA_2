import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout'
import { apiRequest } from '../lib/api'
import { useToast } from '../context/ToastContext.jsx'

const PAGE_SIZE = 6

function ReviewQueue() {
  const [distributions, setDistributions] = useState([])
  const [projects, setProjects] = useState([])
  const [schools, setSchools] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('pending')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [distData, projectData, schoolData, userData] = await Promise.all([
          apiRequest('/distributions'),
          apiRequest('/projects'),
          apiRequest('/schools'),
          apiRequest('/users'),
        ])
        setDistributions(distData)
        setProjects(projectData)
        setSchools(schoolData)
        setUsers(userData)
      } catch (error) {
        addToast(error.message || 'Failed to load review queue.', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast])

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase()

    return distributions
      .filter((d) => {
        const status = d.approvalStatus || 'pending'
        if (statusTab === 'pending') return status === 'pending'
        if (statusTab === 'reviewed') return status !== 'pending'
        return true
      })
      .filter((d) => {
        if (!lower) return true
        const projectName =
          projects.find((p) => p.id === d.projectId)?.name?.toLowerCase() || ''
        const schoolName =
          schools.find((s) => s.id === d.schoolId)?.name?.toLowerCase() || ''
        return (
          projectName.includes(lower) ||
          schoolName.includes(lower) ||
          (d.resourceType || '').toLowerCase().includes(lower) ||
          (d.location || '').toLowerCase().includes(lower)
        )
      })
      .sort((a, b) => {
        const factor = sortDir === 'asc' ? 1 : -1
        const projectA =
          projects.find((p) => p.id === a.projectId)?.name?.toLowerCase() || ''
        const projectB =
          projects.find((p) => p.id === b.projectId)?.name?.toLowerCase() || ''
        const schoolA =
          schools.find((s) => s.id === a.schoolId)?.name?.toLowerCase() || ''
        const schoolB =
          schools.find((s) => s.id === b.schoolId)?.name?.toLowerCase() || ''

        if (sortBy === 'project') return projectA.localeCompare(projectB) * factor
        if (sortBy === 'school') return schoolA.localeCompare(schoolB) * factor
        if (sortBy === 'quantity')
          return ((Number(a.quantity) || 0) - (Number(b.quantity) || 0)) * factor
        if (sortBy === 'girlsImpacted') {
          return (
            ((Number(a.girlsImpacted) || 0) - (Number(b.girlsImpacted) || 0)) *
            factor
          )
        }

        return (String(a.date || '').localeCompare(String(b.date || '')) || 0) * factor
      })
  }, [distributions, projects, schools, search, statusTab, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, statusTab, sortBy, sortDir])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleAction = async (id, approvalStatus) => {
    try {
      await apiRequest(`/distributions/${id}/approval`, {
        method: 'PATCH',
        body: { approvalStatus },
      })
      setDistributions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, approvalStatus } : d)),
      )
      if (approvalStatus === 'pending') {
        addToast('Submission moved back to pending queue.', 'info')
      } else {
        addToast(
          `Submission ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
          'success',
        )
      }
    } catch (error) {
      addToast(error.message || 'Failed to update submission status.', 'error')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Review Queue</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review, sort, and process outreach/distribution submissions.
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project, school or resource..."
            className="w-full md:w-80 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 text-xs">
              {['pending', 'reviewed', 'all'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  className={`px-3 py-1 rounded-md capitalize ${
                    statusTab === tab
                      ? 'bg-[#253290] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1"
              >
                <option value="date">Sort by date</option>
                <option value="project">Sort by project</option>
                <option value="school">Sort by school</option>
                <option value="quantity">Sort by quantity</option>
                <option value="girlsImpacted">Sort by girls impacted</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="border border-gray-200 rounded-lg px-2 py-1"
              >
                {sortDir === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading submissions...</p>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
              No submissions match the selected filters.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginated.map((item) => {
                  const project = projects.find((p) => p.id === item.projectId)
                  const school = schools.find((s) => s.id === item.schoolId)
                  const submitter = users.find((u) => u.id === item.submittedBy)
                  const status = item.approvalStatus || 'pending'

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {project?.name || 'Unknown project'} ·{' '}
                          {school?.name || 'Unknown school'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.resourceType} · Qty {item.quantity} · Girls impacted{' '}
                          {item.girlsImpacted}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.date} · {item.location || 'No location'} · Submitted by{' '}
                          {submitter?.fullName || submitter?.email || 'Unknown'}
                        </p>
                        <p className="text-xs">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 ${
                              status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : status === 'rejected'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {status}
                          </span>
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500">Notes: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction(item.id, 'approved')}
                          className="text-xs bg-emerald-600 text-white rounded-full px-3 py-1.5 hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(item.id, 'rejected')}
                          className="text-xs bg-red-600 text-white rounded-full px-3 py-1.5 hover:bg-red-700"
                        >
                          Reject
                        </button>
                        {status !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleAction(item.id, 'pending')}
                            className="text-xs border border-amber-300 text-amber-700 rounded-full px-3 py-1.5 hover:bg-amber-50"
                          >
                            Revert to pending
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                <p>
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="border border-gray-200 rounded-lg px-2 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="border border-gray-200 rounded-lg px-2 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ReviewQueue

