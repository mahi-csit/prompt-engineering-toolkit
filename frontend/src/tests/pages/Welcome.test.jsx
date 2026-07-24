import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Welcome from '../../pages/Welcome'

describe('Welcome Page', () => {
  it('should render the main heading', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Engineer Better/)).toBeInTheDocument()
    expect(screen.getByText(/Prompts, Faster/)).toBeInTheDocument()
  })

  it('should render the product description', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/all-in-one platform/)).toBeInTheDocument()
    expect(screen.getByText(/create, test, evaluate, and optimize LLM prompts/)).toBeInTheDocument()
  })

  it('should render the branding', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Prompt Toolkit')).toBeInTheDocument()
  })

  it('should render call-to-action buttons', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    const signupLinks = screen.getAllByText(/Create Free Account|Get Started/)
    expect(signupLinks.length).toBeGreaterThan(0)
    
    const signinLinks = screen.getAllByText(/Sign In|Already have an account/)
    expect(signinLinks.length).toBeGreaterThan(0)
  })

  it('should render feature cards', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Prompt Builder')).toBeInTheDocument()
    expect(screen.getByText('Multi-Model Playground')).toBeInTheDocument()
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Evaluator')).toBeInTheDocument()
    expect(screen.getByText('Prompt Library')).toBeInTheDocument()
  })

  it('should render how it works section', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Your Journey to Prompt Mastery/)).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should render value propositions', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Save Time')).toBeInTheDocument()
    expect(screen.getByText('Better Results')).toBeInTheDocument()
    expect(screen.getByText('Stay Organized')).toBeInTheDocument()
  })

  it('should have links to Login and Signup pages', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    const loginLink = screen.getByRole('link', { name: /Sign In/ })
    expect(loginLink).toHaveAttribute('href', '/login')
    
    const signupLinks = screen.getAllByRole('link', { name: /Create Free Account|Get Started/ })
    signupLinks.forEach(link => {
      expect(link.getAttribute('href')).toBe('/signup')
    })
  })

  it('should render footer', () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    )
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument()
  })
})
