import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import 'leaflet/dist/leaflet.css'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './context/ThemeContext'
import { initializeApp, getApps } from 'firebase/app'
import { firebaseConfig } from './firebase/config'

// Initialize Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfig)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
)
