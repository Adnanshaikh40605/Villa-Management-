import { useState, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'
import { usePWA } from '@/contexts/PWAContext'

export default function InstallPWA() {
  const { isInstallable, promptToInstall } = usePWA()
  const [isOpen, setIsOpen] = useState(false)

  // Force open the modal when installable
  useEffect(() => {
    if (isInstallable) {
      setIsOpen(true)
    }
  }, [isInstallable])

  const handleInstall = async () => {
    const outcome = await promptToInstall()
    
    if (outcome === 'accepted') {
      setIsOpen(false)
    } else {
      // If force logic is required:
       window.location.reload()
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} title="Install App Required">
      <div className="space-y-4">
        <p className="text-gray-600">
          To use this application, you must install it on your device. This provides offline access and better performance.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="primary" onClick={handleInstall}>
            Install Now
          </Button>
        </div>
      </div>
    </Modal>
  )
}
