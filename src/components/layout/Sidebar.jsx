import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  selectSidebarOpen,
  selectMobileMenuOpen,
  toggleSidebar,
  setMobileMenuOpen,
} from '@/features/ui/uiSlice'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Villas', href: '/villas', icon: BuildingOfficeIcon },
  { name: 'Bookings', href: '/bookings', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
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
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Villa</span>
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={handleCloseMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={handleCloseMobileMenu}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!sidebarOpen && 'justify-center'}`
              }
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 ${sidebarOpen && 'mr-3'}`} />
              {sidebarOpen && (
                <span className="font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Toggle button (desktop only) */}
        <div className="hidden lg:block p-4 border-t border-gray-200">
          <button
            onClick={handleToggleSidebar}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
