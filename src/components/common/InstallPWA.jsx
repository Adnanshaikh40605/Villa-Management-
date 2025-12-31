import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setIsOpen(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Install App">
      <div className="space-y-4">
        <p className="text-gray-600">
          Install our app for a better experience with offline access and faster loading times.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Later
          </Button>
          <Button variant="primary" onClick={handleInstall}>
            Install Now
          </Button>
        </div>
      </div>
    </Modal>
  )
}
