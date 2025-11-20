import { NavLink, Link, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { useI18n } from './i18n'
import Footer from '@/components/Footer'
import Chatbot from '@/components/Chatbot'
import { Router } from './router'
import Splash from './components/Splash'

export default function App() {
  const { lang, setLang, t } = useI18n()
  const [showSplash, setShowSplash] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = window.localStorage.getItem('ssh_theme') as 'dark'|'light'|null
    return saved === 'light' ? 'light' : 'dark'
  })
  const hideSplash = useCallback(() => setShowSplash(false), [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.setAttribute('data-theme', theme)
    window.localStorage.setItem('ssh_theme', theme)
  }, [theme])

  return (
    <div className="app">
      {showSplash ? (
        <Splash onDone={hideSplash} />
      ) : (
        <>
          <header className="header">
            <Link to="/" className="brand">
              <img src="/logo.svg" alt="Smart ServiceHub" className="logo circle logo-spin" />
            </Link>
            <button className="hamburger" aria-label="Menu" onClick={()=>setMobileNavOpen(v=>!v)}>
              ☰
            </button>
            <nav className={mobileNavOpen ? 'nav open' : 'nav'} onClick={()=>setMobileNavOpen(false)}>
              <NavLink to="/" className={({isActive})=> isActive? 'active' : ''}>{t('nav.home')}</NavLink>
              <NavLink to="/search" className={({isActive})=> isActive? 'active' : ''}>{t('nav.search')}</NavLink>
              <NavLink to="/bookings" className={({isActive})=> isActive? 'active' : ''}>{t('nav.bookings')}</NavLink>
              <NavLink to="/profile" className={({isActive})=> isActive? 'active' : ''}>Profile</NavLink>
              <NavLink to="/provider" className={({isActive})=> isActive? 'active' : ''}>{t('nav.provider')}</NavLink>
              <NavLink to="/admin" className={({isActive})=> isActive? 'active' : ''}>{t('nav.admin')}</NavLink>
              <NavLink to="/login" className={({isActive})=> isActive? 'active' : ''}>{t('nav.login')}</NavLink>
              <Link to="/search" className="btn cta">{t('nav.bookNow')}</Link>
              <button
                type="button"
                className="theme-toggle"
                onClick={e=>{e.stopPropagation(); setTheme(prev=>prev==='dark'?'light':'dark')}}
              >
                {theme === 'dark' ? 'Light' : 'Dark'} mode
              </button>
              <div
                className="lang-switch"
                onClick={e => {
                  // prevent closing mobile nav when interacting with language select
                  e.stopPropagation()
                }}
              >
                <span className="lang-icon" aria-hidden="true">🌐</span>
                <select
                  value={lang}
                  onChange={e=>setLang(e.target.value as any)}
                >
                  <option value="en">English (India)</option>
                  <option value="hi">Hindi (भारत)</option>
                </select>
              </div>
            </nav>
          </header>
          <main className="container">
            <Routes>
              {Router}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </>
      )}
    </div>
  )
}
