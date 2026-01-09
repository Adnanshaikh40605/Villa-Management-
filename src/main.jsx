import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: New content available, click on reload button to update.')
  },
  onOfflineReady() {
    console.log('PWA: App ready to work offline')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

document.addEventListener("wheel", function(event) {
  if (document.activeElement.type === "number") {
    document.activeElement.blur();
  }
});