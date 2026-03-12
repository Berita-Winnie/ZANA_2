import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout'
import {
  ResourcesBySchoolChart,
  DistributionOverTimeChart,
  ResourceAllocationPie,
} from '../components/Charts'
import { apiRequest } from '../lib/api'

function Analytics() {
  const [schools, setSchools] = useState([])
  const [distributions, setDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    resourceType: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [schoolsData, distributionsData] = await Promise.all([
          apiRequest('/schools'),
          apiRequest('/distributions'),
        ])
        setSchools(schoolsData)
        setDistributions(distributionsData)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load analytics data', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const filteredDistributions = useMemo(() => {
    return distributions.filter((d) => {
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
  }, [distributions, filters])

  const resourcesBySchoolData = useMemo(() => {
    const grouped = new Map()
    filteredDistributions.forEach((d) => {
      if (!d.schoolId) return
      const prev = grouped.get(d.schoolId) || 0
      grouped.set(d.schoolId, prev + (Number(d.quantity) || 0))
    })
    return Array.from(grouped.entries()).map(([schoolId, quantity]) => {
      const school = schools.find((s) => s.id === schoolId)
      return {
        schoolName: school?.name || 'Unknown',
        quantity,
      }
    })
  }, [filteredDistributions, schools])

  const distributionOverTimeData = useMemo(() => {
    const grouped = new Map()
    filteredDistributions.forEach((d) => {
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
  }, [filteredDistributions])

  const resourceAllocationData = useMemo(() => {
    const grouped = new Map()
    filteredDistributions.forEach((d) => {
      const type = d.resourceType || 'Unknown'
      const prev = grouped.get(type) || 0
      grouped.set(type, prev + (Number(d.quantity) || 0))
    })

    return Array.from(grouped.entries()).map(([type, value]) => ({
      type,
      value,
    }))
  }, [filteredDistributions])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Understand impact by school, region, and over time.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-3 text-xs bg-white rounded-xl border border-gray-100 shadow-sm p-3">
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
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                From date
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
                To date
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

        {loading ? (
          <p className="text-sm text-gray-500">Loading analytics...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ResourcesBySchoolChart data={resourcesBySchoolData} />
              <DistributionOverTimeChart data={distributionOverTimeData} />
            </div>
            <div className="space-y-6">
              <ResourceAllocationPie data={resourceAllocationData} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Analytics

