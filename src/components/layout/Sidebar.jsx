import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react'
import {
  selectSidebarOpen,
  selectMobileMenuOpen,
  toggleSidebar,
  setMobileMenuOpen,
} from '@/features/ui/uiSlice'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Villas', href: '/villas', icon: Building2 },
  { name: 'Bookings', href: '/bookings', icon: ClipboardList },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const sidebarOpen = useSelector(selectSidebarOpen)
  const mobileMenuOpen = useSelector(selectMobileMenuOpen)

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  const handleCloseMobileMenu = () => {
    dispatch(setMobileMenuOpen(false))
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-16'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                <span className="text-red-500">Vacation</span>
                <span className="text-blue-500">BNR</span>
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-red-500">V</span>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={handleCloseMobileMenu}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={handleCloseMobileMenu}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 group whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                } ${!sidebarOpen && 'justify-center px-2'}`
              }
            >
              <item.icon className={`flex-shrink-0 transition-colors ${sidebarOpen ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} />
              <span className={`font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          {/* Logout Button */}
          <button
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 group ${!sidebarOpen && 'justify-center px-2'}`}
          >
            <LogOut className={`flex-shrink-0 transition-colors ${sidebarOpen ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} />
            <span className={`font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              Logout
            </span>
          </button>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={handleToggleSidebar}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
