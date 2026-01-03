import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  ClipboardList,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Settings
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
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100/50 shadow-soft transition-all duration-500 ease-in-out flex flex-col ${
          sidebarOpen ? 'w-72' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className={`flex items-center h-20 px-6 ${sidebarOpen ? 'justify-between' : 'justify-center'} relative`}>
          <div className="flex items-center gap-3">
             <div className="relative w-10 h-10 flex items-center justify-center bg-primary-50 rounded-xl">
               <img src="/logo-512_512 1.png" alt="Logo" className="w-8 h-8 object-contain" />
             </div>
             <span className={`font-display font-bold text-xl text-gray-900 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
               Villa<span className="text-primary-600">Manager</span>
             </span>
          </div>
          
          {/* Mobile close */}
          <button
            onClick={handleCloseMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={handleCloseMobileMenu}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  } ${!sidebarOpen && 'justify-center px-3'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      size={22}
                      className={`flex-shrink-0 transition-all duration-300 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                      } ${!sidebarOpen && !isActive ? 'mr-0' : 'mr-3'}`} 
                    />
                    
                    <span className={`font-medium tracking-wide transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                      {item.name}
                    </span>

                    {/* Active Indicator Strip */}
                    {isActive && sidebarOpen && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <div className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${!sidebarOpen && 'p-2'}`}>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 p-0.5 shadow-glow">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="Admin" />
                 </div>
               </div>
               
               <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                 <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                 <p className="text-xs text-gray-400 truncate">admin@villa.com</p>
               </div>
             </div>

             <div className={`mt-3 pt-3 border-t border-gray-100 flex items-center justify-between ${!sidebarOpen && 'flex-col gap-2 mt-2 pt-2'}`}>
                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                </button>
                <button
                  onClick={handleToggleSidebar}
                  className="hidden lg:flex p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
             </div>
          </div>
        </div>
      </aside>
    </>
  )
}
