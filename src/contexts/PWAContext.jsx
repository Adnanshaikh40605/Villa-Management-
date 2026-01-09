import { createContext, useContext, useEffect, useState } from 'react'

const PWAContext = createContext(null)

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('PWAContext: beforeinstallprompt captured')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone || 
                         document.referrer.includes('android-app://')

    if (isStandalone) {
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptToInstall = async () => {
    if (!deferredPrompt) {
        console.log("PWAContext: No deferred prompt available")
        return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWAContext: User response to install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null)
    setIsInstallable(false)
    
    return outcome
  }

  const value = {
    isInstallable,
    promptToInstall
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}
