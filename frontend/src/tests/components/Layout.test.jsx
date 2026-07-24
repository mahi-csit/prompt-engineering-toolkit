import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../../components/Layout'

// Mock the context hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// Mock the Sidebar component
vi.mock('../../components/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}))

describe('Layout Component', () => {
  it('should render sidebar and navigation when user is authenticated', () => {
    const { useAuth } = require('../../context/AuthContext')
    const { useTheme } = require('../../context/ThemeContext')
    
    useAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', username: 'testuser' },
      logout: vi.fn(),
    })
    
    useTheme.mockReturnValue({
      dark: false,
      toggle: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )
    
    // Should show Sidebar
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    
    // Should show navigation bar
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Should show content
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    
    // Should show footer
    const footer = screen.getByText(/Enterprise Prompt Engineering Toolkit/)
    expect(footer).toBeInTheDocument()
  })

  it('should NOT render sidebar and navigation when user is not authenticated', () => {
    const { useAuth } = require('../../context/AuthContext')
    const { useTheme } = require('../../context/ThemeContext')
    
    useAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    })
    
    useTheme.mockReturnValue({
      dark: false,
      toggle: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )
    
    // Should NOT show Sidebar
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
    
    // Should NOT show Logout button
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    
    // Should NOT show footer
    expect(screen.queryByText(/Enterprise Prompt Engineering Toolkit/)).not.toBeInTheDocument()
    
    // Should still show content
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should show dark mode toggle when user is authenticated', () => {
    const { useAuth } = require('../../context/AuthContext')
    const { useTheme } = require('../../context/ThemeContext')
    
    const toggleMock = vi.fn()
    
    useAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', username: 'testuser' },
      logout: vi.fn(),
    })
    
    useTheme.mockReturnValue({
      dark: false,
      toggle: toggleMock,
    })

    render(
      <BrowserRouter>
        <Layout>
          <div>Test</div>
        </Layout>
      </BrowserRouter>
    )
    
    // Should have theme toggle button
    const themeToggle = screen.getByRole('button', { name: /Toggle dark mode/ })
    expect(themeToggle).toBeInTheDocument()
  })
})
