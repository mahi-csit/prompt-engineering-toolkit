import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',           label: 'Home',      icon: '🏠' },
  { to: '/dashboard',  label: 'Dashboard', icon: '📊' },
  { to: '/builder',    label: 'Builder',   icon: '🔨' },
  { to: '/library',    label: 'Library',   icon: '📚' },
  { to: '/playground', label: 'Playground',icon: '🎮' },
  { to: '/evaluator',  label: 'Evaluator', icon: '📋' },
  { to: '/optimizer',  label: 'Optimizer', icon: '✨' },
]

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const location = useLocation()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Auto-close sidebar on mobile
      if (mobile) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Hamburger button - only on mobile */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - always full width on desktop, slides in from left on mobile */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-40 flex flex-col ${
          isMobile && !isOpen ? '-translate-x-full' : ''
        }`}
      >
        {/* Logo section */}
        <div className="flex items-center gap-2 h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🧠</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              Toolkit
            </span>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive(to)
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className={`text-lg flex-shrink-0 transition-transform ${isActive(to) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
              </span>
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
