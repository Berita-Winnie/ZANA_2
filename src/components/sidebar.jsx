import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Truck,
  School,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  HandCoins,
  FileText,
  ClipboardCheck,
} from 'lucide-react'
import { assets } from '../assets/assets.js'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { role } = useAuth()

  const superAdminNav = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, to: '/projects' },
    { label: 'Schools', icon: School, to: '/schools' },
    { label: 'Distributions', icon: Truck, to: '/distributions' },
    { label: 'Review Queue', icon: ClipboardCheck, to: '/reviews' },
    { label: 'Donors', icon: HandCoins, to: '/donors' },
    { label: 'Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Users', icon: Users, to: '/users' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ]

  const fieldOfficerNav = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My Projects', icon: FolderKanban, to: '/projects' },
    { label: 'Submit Distribution', icon: Truck, to: '/distributions' },
    { label: 'Schools Reached', icon: School, to: '/schools' },
    { label: 'My Reports', icon: FileText, to: '/analytics' },
  ]

  const donorNav = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Funded Projects', icon: FolderKanban, to: '/projects' },
    { label: 'Impact Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Schools Reached', icon: School, to: '/schools' },
  ]

  let navItems = fieldOfficerNav
  if (role === 'superAdmin') navItems = superAdminNav
  else if (role === 'donor') navItems = donorNav

  return (
    <div
      className={`h-screen bg-white text-gray-600 p-4 border-r transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src={assets.bird_2} width={48} alt="Zana RMS logo" />
          {!collapsed && (
            <h2 className="text-xl font-bold text-[#253290] whitespace-nowrap">
              Zana{' '}
              <span className="text-[#a124c2]">R</span>
              <span className="text-[#3b9369]">M</span>
              <span className="text-[#f47f8b]">S</span>
            </h2>
          )}
        </div>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-gray-100 text-gray-500"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.to)

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#253290] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Sidebar
