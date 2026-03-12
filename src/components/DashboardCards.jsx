import { ArrowUpRight, AlertTriangle } from 'lucide-react'

function StatCard({ label, value, subtitle, accentColor = 'bg-indigo-100' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && (
          <span
            className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 ${accentColor} text-gray-700`}
          >
            <ArrowUpRight size={12} />
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

export function DashboardCards({ stats, lowResourceProjects }) {
  const {
    totalResources = 0,
    schoolsReached = 0,
    girlsImpacted = 0,
    activeProjects = 0,
  } = stats || {}

  return (
    <div className="space-y-4">
      {lowResourceProjects && lowResourceProjects.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={18} className="mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Low resources alert</p>
            <p className="text-xs mt-0.5">
              The following projects are running low on resources:{' '}
              <span className="font-semibold">
                {lowResourceProjects.map((p) => p.name).join(', ')}
              </span>
              .
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Resources Distributed"
          value={totalResources}
          subtitle="Across all distributions"
        />
        <StatCard
          label="Schools Reached"
          value={schoolsReached}
          subtitle="Active partner schools"
          accentColor="bg-emerald-100"
        />
        <StatCard
          label="Girls Impacted"
          value={girlsImpacted}
          subtitle="Reported impact"
          accentColor="bg-pink-100"
        />
        <StatCard
          label="Active Projects"
          value={activeProjects}
          subtitle="Ongoing initiatives"
          accentColor="bg-sky-100"
        />
      </div>
    </div>
  )
}

