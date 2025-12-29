import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectSidebarOpen } from '@/features/ui/uiSlice'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout() {
  const sidebarOpen = useSelector(selectSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
