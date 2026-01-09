import { useState, useEffect } from 'react'
import { usePWA } from '@/contexts/PWAContext'
import { X } from 'lucide-react'

export default function InstallPWA() {
  const { isInstallable, promptToInstall } = usePWA()
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Show popup when installable and not dismissed
  useEffect(() => {
    // Check if user has dismissed the popup before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    
    if (isInstallable && !dismissed) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isInstallable])

  const handleInstall = async () => {
    const outcome = await promptToInstall()
    
    if (outcome === 'accepted') {
      setIsOpen(false)
      localStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setIsDismissed(true)
    // Don't permanently dismiss, allow it to show again on next visit
    // If you want permanent dismissal, uncomment:
    // localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!isOpen || !isInstallable) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={handleCancel}
      />
      
      {/* Install Popup - Browser Native Style */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Install app?</h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-3 shadow-lg">
                  <img 
                    src="/logo-512_512 1.png" 
                    alt="Villa Manager" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* App Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  VillaManager
                </h4>
                <p className="text-sm text-gray-500 break-all">
                  {window.location.origin}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  This app will be installed on your device for quick access and offline use.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInstall}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
