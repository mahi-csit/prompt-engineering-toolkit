import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Enterprise Prompt Engineering Toolkit')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/production-grade platform/)).toBeInTheDocument()
  })

  it('should render feature cards', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Prompt Builder')).toBeInTheDocument()
    expect(screen.getByText('Playground')).toBeInTheDocument()
    expect(screen.getByText('Evaluator')).toBeInTheDocument()
  })

  it('should render status message', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Phase 1 Foundation complete/)).toBeInTheDocument()
  })
})
