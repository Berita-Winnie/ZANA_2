import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout'
import { ProjectCard } from '../components/ProjectCard'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

function emptyProject() {
  return {
    name: '',
    description: '',
    donors: '',
    resourcesAllocated: '',
    resourcesRemaining: '',
    schoolsCovered: '',
    startDate: '',
    endDate: '',
  }
}

function Projects() {
  const [projects, setProjects] = useState([])
  const [distributions, setDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyProject())
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const { role, profile } = useAuth()
  const { addToast } = useToast()
  const canEdit = role === 'superAdmin'

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const [projectsData, distributionsData] = await Promise.all([
          apiRequest('/projects'),
          apiRequest('/distributions'),
        ])
        setProjects(projectsData)
        setDistributions(distributionsData)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load projects', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const projectsWithStats = useMemo(() => {
    const assigned = profile?.assignedProjects || []
    const donorProjects = profile?.donorProjects || []

    let visible = projects
    if (role === 'fieldOfficer') {
      visible = assigned.length
        ? projects.filter((p) => assigned.includes(p.id))
        : []
    } else if (role === 'donor') {
      visible = donorProjects.length
        ? projects.filter((p) => donorProjects.includes(p.id))
        : []
    }

    return visible.map((project) => {
      const projectDists = distributions.filter(
        (d) => d.projectId === project.id,
      )
      const schoolIds = new Set(
        projectDists.map((d) => d.schoolId).filter(Boolean),
      )
      const girlsImpacted = projectDists.reduce(
        (sum, d) => sum + (Number(d.girlsImpacted) || 0),
        0,
      )

      return {
        ...project,
        schoolsReached: schoolIds.size,
        girlsImpacted,
      }
    })
  }, [projects, distributions, role, profile])

  const resetForm = () => {
    setForm(emptyProject())
    setEditingId(null)
  }

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
        description: form.description,
        donors: form.donors
          ? form.donors.split(',').map((d) => d.trim())
          : [],
        resourcesAllocated: Number(form.resourcesAllocated) || 0,
        resourcesRemaining: Number(form.resourcesRemaining) || 0,
        schoolsCovered: form.schoolsCovered
          ? form.schoolsCovered.split(',').map((s) => s.trim())
          : [],
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }

      if (editingId) {
        const updated = await apiRequest(`/projects/${editingId}`, {
          method: 'PUT',
          body: payload,
        })
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        )
      } else {
        const created = await apiRequest('/projects', {
          method: 'POST',
          body: payload,
        })
        setProjects((prev) => [...prev, created])
      }
      setFormSuccess(editingId ? 'Project updated successfully.' : 'Project created successfully.')
      addToast(editingId ? 'Project updated successfully.' : 'Project created successfully.', 'success')
      resetForm()
    } catch (error) {
      const msg = error.message || 'Failed to save project.'
      setFormError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (project) => {
    setFormError('')
    setFormSuccess('')
    setEditingId(project.id)
    setForm({
      name: project.name || '',
      description: project.description || '',
      donors: (project.donors || []).join(', '),
      resourcesAllocated: project.resourcesAllocated || '',
      resourcesRemaining: project.resourcesRemaining || '',
      schoolsCovered: (project.schoolsCovered || []).join(', '),
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    })
  }

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm('Delete this project?')
    if (!confirmed) return

    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' })
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      const msg = error.message || 'Failed to delete project.'
      setFormError(msg)
      addToast(msg, 'error')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              {role === 'superAdmin'
                ? 'Manage ongoing projects, donors, and allocated resources.'
                : role === 'donor'
                  ? 'View projects you are funding and their impact.'
                  : 'View projects assigned to you and their progress.'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading projects...</p>
            ) : projectsWithStats.length === 0 ? (
              <p className="text-sm text-gray-500">
                No projects to show yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projectsWithStats.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    canEdit={canEdit}
                    onEdit={canEdit ? () => handleEdit(project) : undefined}
                    onDelete={canEdit ? () => handleDelete(project.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {canEdit && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                {editingId ? 'Edit project' : 'Add new project'}
              </h2>
              <FormFeedback error={formError} success={formSuccess} className="mb-2" />
              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Project name
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
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Resources allocated
                    </label>
                    <input
                      type="number"
                      name="resourcesAllocated"
                      value={form.resourcesAllocated}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Resources remaining
                    </label>
                    <input
                      type="number"
                      name="resourcesRemaining"
                      value={form.resourcesRemaining}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Donors (comma separated)
                  </label>
                  <input
                    type="text"
                    name="donors"
                    value={form.donors}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Schools covered (comma separated)
                  </label>
                  <input
                    type="text"
                    name="schoolsCovered"
                    value={form.schoolsCovered}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#253290] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#1b2568] disabled:opacity-60"
                  >
                    {editingId ? 'Update project' : 'Add project'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Projects

