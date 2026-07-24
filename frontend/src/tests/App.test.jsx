import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn(),
}))

// Mock the theme context
vi.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: vi.fn(() => ({ dark: false, toggle: vi.fn() })),
}))

// Mock page components
vi.mock('../pages/Welcome', () => ({
  default: () => <div>Welcome Page</div>,
}))

vi.mock('../pages/Login', () => ({
  default: () => <div>Login Page</div>,
}))

vi.mock('../pages/Signup', () => ({
  default: () => <div>Signup Page</div>,
}))

vi.mock('../pages/HomeRoute', () => ({
  default: () => <div>Home Route</div>,
}))

vi.mock('../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard</div>,
}))

vi.mock('../pages/PromptBuilder', () => ({
  default: () => <div>Prompt Builder</div>,
}))

vi.mock('../pages/PromptLibrary', () => ({
  default: () => <div>Prompt Library</div>,
}))

vi.mock('../pages/Playground', () => ({
  default: () => <div>Playground</div>,
}))

vi.mock('../pages/Evaluator', () => ({
  default: () => <div>Evaluator</div>,
}))

vi.mock('../pages/PromptOptimizer', () => ({
  default: () => <div>Prompt Optimizer</div>,
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div>Not Found</div>,
}))

describe('App Navigation Flow', () => {
  let useAuthMock

  beforeEach(() => {
    const { useAuth } = require('../context/AuthContext')
    useAuthMock = useAuth
  })

  it('should show loading spinner while checking auth', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    
    // Look for the loading spinner indicator
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should show Welcome page when user is not authenticated', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    
    expect(screen.getByText('Welcome Page')).toBeInTheDocument()
  })

  it('should show full app when user is authenticated', () => {
    useAuthMock.mockReturnValue({
      user: { id: '1', email: 'test@example.com', username: 'testuser' },
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    
    // Should render the Layout component (which wraps the authenticated app)
    expect(screen.getByText('Home Route')).toBeInTheDocument()
  })
})
