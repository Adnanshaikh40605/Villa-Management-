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
      console.log('✅ PWAContext: beforeinstallprompt event captured!')
      console.log('PWA is now installable')
    }

    // Check if the event was already captured in index.html
    if (window.deferredPrompt) {
      console.log('✅ PWAContext: Found pre-captured event from window')
      setDeferredPrompt(window.deferredPrompt)
      setIsInstallable(true)
      window.deferredPrompt = null // Clear it
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone || 
                         document.referrer.includes('android-app://')

    if (isStandalone) {
      console.log('ℹ️ PWAContext: App is already in standalone mode (installed)')
      setIsInstallable(false)
    } else {
      console.log('ℹ️ PWAContext: App is running in browser mode')
      console.log('ℹ️ Waiting for beforeinstallprompt event...')
    }

    // Debug: Log current state
    console.log('PWAContext initialized:', {
      isStandalone,
      hasPreCapturedEvent: !!window.deferredPrompt
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptToInstall = async () => {
    console.log('🔔 Install button clicked')
    
    if (!deferredPrompt) {
        console.error('❌ PWAContext: No deferred prompt available')
        console.log('This could mean:')
        console.log('1. The app is already installed')
        console.log('2. The browser does not support PWA installation')
        console.log('3. The beforeinstallprompt event has not fired yet')
        alert('Installation is not available. The app may already be installed or your browser does not support PWA installation.')
        return null
    }

    try {
      console.log('📱 Showing install prompt...')
      // Show the install prompt
      deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log(`✅ PWAContext: User response to install prompt: ${outcome}`)

      // We've used the prompt, and can't use it again
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      return outcome
    } catch (error) {
      console.error('❌ Error during PWA installation:', error)
      return null
    }
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
