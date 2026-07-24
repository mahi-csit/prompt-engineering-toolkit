import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModelComparison from '../../components/ModelComparison'

describe('ModelComparison', () => {
  it('should render empty state when no responses', () => {
    render(<ModelComparison responses={[]} />)
    expect(screen.getByText('No responses to display')).toBeInTheDocument()
  })

  it('should render successful responses', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Test response',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('claude-3-sonnet-20240229')).toBeInTheDocument()
    expect(screen.getByText('Test response')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('should render failed responses', () => {
    const responses = [
      {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        content: '',
        latency_ms: 200,
        token_count: null,
        finish_reason: null,
        success: false,
        error: 'Timeout error'
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('gpt-4-turbo-preview')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Timeout error')).toBeInTheDocument()
  })

  it('should render multiple responses', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Response 1',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      },
      {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        content: 'Response 2',
        latency_ms: 150,
        token_count: 60,
        finish_reason: 'stop',
        success: true,
        error: null
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('claude-3-sonnet-20240229')).toBeInTheDocument()
    expect(screen.getByText('gpt-4-turbo-preview')).toBeInTheDocument()
    expect(screen.getByText('Response 1')).toBeInTheDocument()
    expect(screen.getByText('Response 2')).toBeInTheDocument()
  })

  it('should display latency for successful responses', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Test',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('100ms')).toBeInTheDocument()
  })

  it('should display token count when available', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Test',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should display finish reason when available', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Test',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('End_turn')).toBeInTheDocument()
  })

  it('should handle mixed success and failure', () => {
    const responses = [
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        content: 'Success',
        latency_ms: 100,
        token_count: 50,
        finish_reason: 'end_turn',
        success: true,
        error: null
      },
      {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        content: '',
        latency_ms: 200,
        token_count: null,
        finish_reason: null,
        success: false,
        error: 'Error'
      }
    ]

    render(<ModelComparison responses={responses} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })
})
