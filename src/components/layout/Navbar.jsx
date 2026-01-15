import { useDispatch } from 'react-redux'
import {
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { setMobileMenuOpen } from '@/features/ui/uiSlice'

export default function Navbar() {
  const dispatch = useDispatch()

  const handleMobileMenuToggle = () => {
    dispatch(setMobileMenuOpen(true))
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 lg:hidden">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={handleMobileMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  )
}
