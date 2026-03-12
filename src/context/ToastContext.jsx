/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const ToastContext = createContext(null)

function ToastItem({ toast, onClose }) {
  const icon =
    toast.type === 'success' ? (
      <CheckCircle2 size={16} />
    ) : toast.type === 'error' ? (
      <AlertTriangle size={16} />
    ) : (
      <Info size={16} />
    )

  const colorClass =
    toast.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : toast.type === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-sky-200 bg-sky-50 text-sky-800'

  return (
    <div
      className={`w-full max-w-sm rounded-lg border shadow-sm px-3 py-2 flex items-start justify-between gap-3 ${colorClass}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5">{icon}</span>
        <p className="text-xs">{toast.message}</p>
      </div>
      <button
        type="button"
        className="opacity-80 hover:opacity-100"
        onClick={() => onClose(toast.id)}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

