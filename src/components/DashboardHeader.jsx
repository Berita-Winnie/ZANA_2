import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function DashboardHeader() {
  const { user, profile, role, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const name = profile?.fullName || user?.displayName || user?.email || 'there'

  const roleLabel =
    role === 'superAdmin'
      ? 'Super Admin'
      : role === 'fieldOfficer'
        ? 'Field Officer'
        : role === 'donor'
          ? 'Donor'
          : ''

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed', error)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s an overview of your impact today.
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:bg-gray-50"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#253290] text-white">
            <User size={16} />
          </span>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
              {name}
            </span>
            {roleLabel && (
              <span className="mt-0.5 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {roleLabel}
              </span>
            )}
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg text-sm z-10">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate(role === 'superAdmin' ? '/settings' : '/dashboard')
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHeader

