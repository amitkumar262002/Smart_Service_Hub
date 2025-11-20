import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
      console.log('✅ PWA install prompt available')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully')
      setShowPrompt(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsInstalling(false)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    setInstallProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 30
        })
      }, 300)

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      clearInterval(progressInterval)

      if (outcome === 'accepted') {
        setInstallProgress(100)
        setTimeout(() => {
          setShowPrompt(false)
          setIsInstalled(true)
          setIsInstalling(false)
          setInstallProgress(0)
        }, 500)
      } else {
        setIsInstalling(false)
        setInstallProgress(0)
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error('Installation error:', error)
      setIsInstalling(false)
      setInstallProgress(0)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Show again after 24 hours
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString())
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
      zIndex: 9999,
      maxWidth: '320px',
      overflow: 'hidden',
      animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(120px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px', animation: 'pulse 2s infinite' }}>📱</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
            Install App
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: '1.4' }}>
          Get quick access to Smart Service Hub on your home screen
        </p>
      </div>

      {/* Features */}
      <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>⚡</span>
            <span>Fast Access</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>📴</span>
            <span>Offline Ready</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isInstalling && (
        <div style={{
          height: '3px',
          background: 'rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              background: '#fff',
              width: `${installProgress}%`,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          />
        </div>
      )}

      {/* Buttons */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: '8px' }}>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: isInstalling ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            opacity: isInstalling ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            if (!isInstalling) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {isInstalling ? (
            <>
              <span style={{ animation: 'pulse 1s infinite' }}>⏳</span>
              Installing...
            </>
          ) : (
            <>
              <span>⬇️</span>
              Install Now
            </>
          )}
        </button>
        <button
          onClick={handleDismiss}
          disabled={isInstalling}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: isInstalling ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            opacity: isInstalling ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isInstalling) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
        >
          Later
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
      >
        ✕
      </button>
    </div>
  )
}
