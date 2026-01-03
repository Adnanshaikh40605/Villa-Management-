import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { setMobileMenuOpen } from '@/features/ui/uiSlice'
import { logout } from '@/features/auth/authSlice'
import toast from 'react-hot-toast'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleMobileMenuToggle = () => {
    dispatch(setMobileMenuOpen(true))
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={handleMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Search bar (optional) */}
        <div className="hidden md:block">
          <input
            type="search"
            placeholder="Search..."
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* User menu */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <UserCircleIcon className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
