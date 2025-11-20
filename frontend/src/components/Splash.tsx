import { useEffect, useRef } from 'react'

export default function Splash({ onDone, delayMs = 3000 }: { onDone: () => void; delayMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Advanced gradient animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let running = true
    let time = 0
    const DPR = Math.min(2, window.devicePixelRatio || 1)

    const resize = () => {
      const { innerWidth:w, innerHeight:h } = window
      canvas.width = w * DPR
      canvas.height = h * DPR
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate animated particles
    const PARTICLE_COUNT = 80
    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      t: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 1.5,
      color: ['#667eea', '#764ba2', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]
    }))

    const draw = () => {
      if (!running) return
      time += 0.01
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e293b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.t += 0.04 * p.s
        
        // Wrap around edges
        if (p.x < 0) p.x = window.innerWidth
        if (p.x > window.innerWidth) p.x = 0
        if (p.y < 0) p.y = window.innerHeight
        if (p.y > window.innerHeight) p.y = 0

        const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(p.t))
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Finish instantly by default (no visible timing delay)
  useEffect(() => {
    const t = setTimeout(onDone, delayMs)
    return () => clearTimeout(t)
  }, [onDone, delayMs])

  return (
    <div className="splash-root">
      <canvas ref={canvasRef} className="splash-canvas" aria-hidden="true" />
      <div className="splash-card" style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px 30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        maxWidth: '450px',
        animation: 'fadeInScale 0.8s ease-out'
      }}>
        <div className="splash-badge spin360" style={{
          animation: 'spin 3s linear infinite'
        }}>
          <div className="badge" style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '50px' }}>🏢</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            textAlign: 'center',
            padding: '0 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Smart Service Hub
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#cbd5e1',
              lineHeight: 1.6,
              fontWeight: 500
            }}
          >
            Trusted Local Services at Your Doorstep
            <br />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Verified professionals • Transparent pricing • 24/7 support
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 16,
            }}
          >
            {[
              { icon: '✓', label: 'Verified' },
              { icon: '⚡', label: 'Fast' },
              { icon: '🛡️', label: 'Secure' }
            ].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: '8px 14px',
                  borderRadius: 20,
                  background: 'rgba(102, 126, 234, 0.15)',
                  border: '1px solid rgba(102, 126, 234, 0.4)',
                  color: '#e0e7ff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{item.icon}</span> {item.label}
              </span>
            ))}
          </div>

          {/* Loading bar */}
          <div
            style={{
              marginTop: 20,
              height: '4px',
              background: 'rgba(102, 126, 234, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '2px',
                animation: 'loading 2s ease-in-out infinite'
              }}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'rgba(148, 163, 184, 0.8)',
              fontWeight: 600
            }}
          >
            Loading your experience…
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes loading {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
        }
        .splash-root {
          animation: fadeInScale 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
