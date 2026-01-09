import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      console.log('pwa-install: beforeinstallprompt fired', e);
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
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null)
    
    if (outcome === 'accepted') {
      setIsOpen(false)
    } else {
      // If they dismissed, we can't prompt again immediately with the same event.
      // But we want to be "forceful", so we keep the modal open or show a message.
      // Since we can't re-trigger prompt, we might just have to reload or tell them to install manually.
      // For now, let's keep it open but maybe change the text or reload.
      // Reloading might give another chance if the browser allows.
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
