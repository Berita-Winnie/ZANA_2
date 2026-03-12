import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout'
import { DashboardCards } from '../components/DashboardCards'
import { SearchBar } from '../components/SearchBar'
import DashboardHeader from '../components/DashboardHeader.jsx'
import {
  ResourcesBySchoolChart,
  DistributionOverTimeChart,
  ResourceAllocationPie,
} from '../components/Charts'
import { apiRequest } from '../lib/api'

function Dashboard() {
  const [schools, setSchools] = useState([])
  const [projects, setProjects] = useState([])
  const [distributions, setDistributions] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
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
        console.error('Failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const stats = useMemo(() => {
    const totalResources = distributions.reduce(
      (sum, d) => sum + (Number(d.quantity) || 0),
      0,
    )
    const girlsImpacted = distributions.reduce(
      (sum, d) => sum + (Number(d.girlsImpacted) || 0),
      0,
    )

    const activeProjects = projects.filter(
      (p) => !p.status || p.status === 'active',
    ).length

    return {
      totalResources,
      schoolsReached: schools.length,
      girlsImpacted,
      activeProjects,
    }
  }, [distributions, projects, schools.length])

  const lowResourceProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          typeof p.resourcesRemaining === 'number' &&
          typeof p.resourcesAllocated === 'number' &&
          p.resourcesAllocated > 0 &&
          p.resourcesRemaining / p.resourcesAllocated <= 0.25,
      ),
    [projects],
  )

  const resourcesBySchoolData = useMemo(() => {
    const grouped = new Map()
    distributions.forEach((d) => {
      if (!d.schoolId) return
      const key = d.schoolId
      const prev = grouped.get(key) || 0
      grouped.set(key, prev + (Number(d.quantity) || 0))
    })

    return Array.from(grouped.entries()).map(([schoolId, quantity]) => {
      const school = schools.find((s) => s.id === schoolId)
      return {
        schoolName: school?.name || 'Unknown',
        quantity,
      }
    })
  }, [distributions, schools])

  const distributionOverTimeData = useMemo(() => {
    const grouped = new Map()
    distributions.forEach((d) => {
      if (!d.date) return
      const date =
        typeof d.date === 'string'
          ? d.date
          : d.date.toDate
            ? d.date.toDate().toISOString().slice(0, 10)
            : ''
      if (!date) return
      const prev = grouped.get(date) || 0
      grouped.set(date, prev + (Number(d.quantity) || 0))
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, quantity]) => ({ date, quantity }))
  }, [distributions])

  const resourceAllocationData = useMemo(() => {
    const grouped = new Map()
    distributions.forEach((d) => {
      const type = d.resourceType || 'Unknown'
      const prev = grouped.get(type) || 0
      grouped.set(type, prev + (Number(d.quantity) || 0))
    })

    return Array.from(grouped.entries()).map(([type, value]) => ({
      type,
      value,
    }))
  }, [distributions])

  const recentDistributions = useMemo(
    () => distributions.slice(0, 5),
    [distributions],
  )

  const recentSchools = useMemo(
    () => schools.slice(0, 5),
    [schools],
  )

  const handleSearch = (query) => {
    if (!query) {
      setSearchResults([])
      return
    }

    const lower = query.toLowerCase()

    const schoolMatches = schools
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(lower) ||
          s.location?.toLowerCase().includes(lower),
      )
      .map((s) => ({
        type: 'school',
        id: s.id,
        name: s.name,
        location: s.location,
        girlsImpacted: s.girlsCount || 0,
        resourcesReceived: distributions
          .filter((d) => d.schoolId === s.id)
          .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0),
      }))

    const distributionMatches = distributions
      .filter(
        (d) =>
          d.resourceType?.toLowerCase().includes(lower) ||
          d.location?.toLowerCase?.().includes(lower),
      )
      .map((d) => ({
        type: 'distribution',
        id: d.id,
        resourceType: d.resourceType,
        girlsImpacted: d.girlsImpacted,
        quantity: d.quantity,
        date: d.date,
      }))

    setSearchResults([...schoolMatches, ...distributionMatches])
  }

  return (
    <Layout>
      <div className="space-y-6">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Track resources distributed to schools and girls reached.
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        <DashboardCards stats={stats} lowResourceProjects={lowResourceProjects} />

        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Search results
            </h3>
            <div className="divide-y divide-gray-100 text-sm">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {result.type === 'school' ? result.name : result.resourceType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.type === 'school'
                        ? result.location
                        : `Quantity: ${result.quantity} • Girls impacted: ${result.girlsImpacted}`}
                    </p>
                  </div>
                  {result.type === 'school' && (
                    <p className="text-xs text-gray-500">
                      Resources received: {result.resourcesReceived}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ResourcesBySchoolChart data={resourcesBySchoolData} />
            <DistributionOverTimeChart data={distributionOverTimeData} />
          </div>
          <div className="space-y-6">
            <ResourceAllocationPie data={resourceAllocationData} />

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Recent distributions
              </h3>
              <ul className="space-y-2 text-xs">
                {recentDistributions.map((d) => (
                  <li
                    key={d.id}
                    className="flex justify-between items-center border-b border-gray-100 last:border-none pb-2 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {d.resourceType}{' '}
                        <span className="text-gray-400">· {d.quantity}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Girls impacted: {d.girlsImpacted || 0}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {d.date
                        ? typeof d.date === 'string'
                          ? d.date
                          : d.date.toDate
                            ? d.date.toDate().toLocaleDateString()
                            : ''
                        : ''}
                    </span>
                  </li>
                ))}
                {recentDistributions.length === 0 && !loading && (
                  <li className="text-xs text-gray-400">
                    No distributions recorded yet.
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Recently added schools
              </h3>
              <ul className="space-y-2 text-xs">
                {recentSchools.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{s.name}</p>
                      <p className="text-[11px] text-gray-500">{s.location}</p>
                    </div>
                    {typeof s.girlsCount === 'number' && (
                      <span className="text-[11px] text-gray-500">
                        {s.girlsCount} girls
                      </span>
                    )}
                  </li>
                ))}
                {recentSchools.length === 0 && !loading && (
                  <li className="text-xs text-gray-400">
                    No schools added yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
