import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Landing from './Landing'

function HomeRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <Landing />
}

export default HomeRoute
