import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import HomeRoute from './pages/HomeRoute'
import Dashboard from './pages/Dashboard'
import PromptBuilder from './pages/PromptBuilder'
import PromptLibrary from './pages/PromptLibrary'
import Playground from './pages/Playground'
import Evaluator from './pages/Evaluator'
import PromptOptimizer from './pages/PromptOptimizer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

/**
 * AppRouter component that conditionally renders Welcome page or full app
 * based on authentication status
 */
function AppRouter() {
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // If not authenticated, show Welcome page only
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    )
  }

  // If authenticated, show full app with Layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<PromptBuilder />} />
        <Route path="/library" element={<PromptLibrary />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/evaluator" element={<Evaluator />} />
        <Route path="/optimizer" element={<PromptOptimizer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRouter />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
