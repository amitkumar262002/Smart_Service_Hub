import Navbar from './Navbar'
import Footer from './Footer'
import { THEME } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isDark, setIsDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light

  return (
    <div style={{
      background: theme.bg.primary,
      color: theme.text.primary,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
      overflow: 'visible',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0
    }}>
      {/* Navbar - Sticky */}
      <Navbar />

      {/* Main Content - No scrolling, attached to background */}
      <main style={{
        flex: 1,
        overflow: 'visible',
        width: '100%',
        boxSizing: 'border-box',
        background: theme.bg.primary
      }}>
        {children}
      </main>

      {/* Footer - Attached to bottom */}
      <Footer />

      {/* Global Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${theme.bg.secondary};
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.bg.tertiary};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.text.tertiary};
        }
      `}</style>
    </div>
  )
}
