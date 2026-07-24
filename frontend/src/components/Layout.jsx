import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from './Sidebar'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 flex flex-col">
      {/* Sidebar - only show if user is authenticated */}
      {user && <Sidebar />}

      {/* Main layout with fixed left margin for desktop */}
      <div className={`flex flex-col flex-1 ${user && !isMobile ? 'lg:ml-64' : ''}`}>
        {/* Top navigation bar - only show if user is authenticated */}
        {user && (
          <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                {/* Logo and branding */}
                <Link to="/" className="flex items-center gap-2 shrink-0 lg:hidden">
                  <span className="text-2xl">🧠</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    Prompt Toolkit
                  </span>
                </Link>

                {/* Right controls */}
                <div className="flex items-center gap-3 ml-auto">
                  {/* Dark mode toggle */}
                  <button
                    onClick={toggle}
                    aria-label="Toggle dark mode"
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {dark ? '☀️' : '🌙'}
                  </button>

                  {/* User info and logout button */}
                  <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-3">
                    <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                      {user.username || user.email}
                    </span>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Page content */}
        <main className={`flex-1 ${user ? 'px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
          {children}
        </main>

        {/* Footer - only show if user is authenticated */}
        {user && (
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-6 text-center text-sm text-gray-500 dark:text-gray-500">
            Enterprise Prompt Engineering Toolkit &copy; {new Date().getFullYear()}
          </footer>
        )}
      </div>
    </div>
  )
}

export default Layout
