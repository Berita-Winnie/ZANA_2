export function FormFeedback({ error, success, className = '' }) {
  if (!error && !success) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {success}
        </div>
      )}
    </div>
  )
}

