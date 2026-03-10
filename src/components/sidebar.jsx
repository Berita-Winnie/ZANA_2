import { Link } from 'react-router-dom'
import { LayoutDashboard, Package, Truck, BarChart3 } from 'lucide-react'
import { assets } from '../assets/assets.js'
function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white text-gray-600 p-6">
      <div className="flex flex-row items-center">
        <img src={assets.bird_2} width={80} alt="" />
        <h2 className="text-xl font-bold  mb-10  pt-8  text-[#253290] ">
          Zana <span className="text-[#a124c2]">R</span>
          <span className="text-[#3b9369]">M</span>
          <span className="text-[#f47f8b]">S </span>
        </h2>
      </div>

      <ul className="space-y-3">
        <li className="flex items-center gap-2  p-2 hover:bg-gray-300">
          <LayoutDashboard size={20} />
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li className="flex items-center gap-2 p-2 hover:bg-gray-300">
          <Package size={20} />
          <Link to="/resources">Resources</Link>
        </li>

        <li className="flex items-center gap-3 p-2 hover:bg-gray-300">
          <Truck size={20} />
          <Link to="/distributions">Distributions</Link>
        </li>

        <li className="flex items-center gap-2 p-2 hover:bg-gray-300">
          <BarChart3 size={20} />
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
