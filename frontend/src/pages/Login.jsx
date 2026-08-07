import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = typeof err === 'string' 
        ? err 
        : err.message || err.response?.data?.detail || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoUsername, demoPassword) => {
    setError('')
    setEmail(demoUsername)
    setPassword(demoPassword)
    setLoading(true)
    try {
      await login(demoUsername, demoPassword)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : err.message || err.response?.data?.detail || 'Demo login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <span className="text-4xl">🧠</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sign in to access your Prompt Engineering Toolkit
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com or testuser"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              ⚡ Quick Demo Access (1-Click)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('testuser', 'password123')}
                disabled={loading}
                className="flex-1 py-2 px-3 text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-medium rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                Demo User
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'adminpassword123')}
                disabled={loading}
                className="flex-1 py-2 px-3 text-xs bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-medium rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
              >
                Admin User
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
