import { Users, Package, MapPin, Trash2, Edit3 } from 'lucide-react'

export function ProjectCard({ project, onEdit, onDelete, canEdit = true }) {
  const {
    name,
    description,
    donors = [],
    resourcesAllocated = 0,
    resourcesRemaining = 0,
    schoolsCovered = [],
    schoolsReached,
    girlsImpacted,
    startDate,
    endDate,
    progress = 0,
  } = project

  const progressValue = Math.max(0, Math.min(100, progress))

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <Edit3 size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-50 text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Users size={14} />
          {typeof schoolsReached === 'number'
            ? `${schoolsReached} schools`
            : `${schoolsCovered.length} schools`}
        </span>
        <span className="inline-flex items-center gap-1">
          <Package size={14} />
          {resourcesRemaining}/{resourcesAllocated} resources remaining
        </span>
        {donors.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {donors.join(', ')}
          </span>
        )}
        {typeof girlsImpacted === 'number' && (
          <span className="inline-flex items-center gap-1 text-pink-700">
            {girlsImpacted} girls impacted
          </span>
        )}
      </div>

      <div className="mt-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Distribution progress</span>
          <span>{progressValue}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#253290] via-[#a124c2] to-[#f47f8b]"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {(startDate || endDate) && (
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          {startDate && <span>Start: {startDate}</span>}
          {endDate && <span>End: {endDate}</span>}
        </div>
      )}
    </div>
  )
}

