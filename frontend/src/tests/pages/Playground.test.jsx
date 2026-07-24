import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Playground from '../../pages/Playground'
import * as playgroundAPI from '../../api/playground'

// Mock the playground API
vi.mock('../../api/playground')

describe('Playground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderPlayground = () => {
    return render(
      <BrowserRouter>
        <Playground />
      </BrowserRouter>
    )
  }

  it('should render the playground page', () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([
      { provider: 'anthropic', name: 'Anthropic' }
    ])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])

    renderPlayground()

    expect(screen.getByText('Playground')).toBeInTheDocument()
    expect(screen.getByText('Test prompts against multiple models simultaneously')).toBeInTheDocument()
  })

  it('should fetch providers on mount', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([
      { provider: 'anthropic', name: 'Anthropic' }
    ])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      expect(playgroundAPI.getAvailableProviders).toHaveBeenCalled()
    })
  })

  it('should fetch models on mount', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])

    renderPlayground()

    await waitFor(() => {
      expect(playgroundAPI.getAvailableModels).toHaveBeenCalled()
    })
  })

  it('should update prompt on change', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
      expect(textarea.value).toBe('Test prompt')
    })
  })

  it('should show error when running without prompt', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Please enter a prompt/)).toBeInTheDocument()
    })
  })

  it('should show error when running without selected models', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Please select at least one model/)).toBeInTheDocument()
    })
  })

  it('should run comparison successfully', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([
      { provider: 'anthropic', name: 'Anthropic' }
    ])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])
    playgroundAPI.compareModels.mockResolvedValue({
      prompt: 'Test prompt',
      responses: [
        {
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          content: 'Response',
          latency_ms: 100,
          token_count: 50,
          finish_reason: 'end_turn',
          success: true,
          error: null
        }
      ],
      total_latency_ms: 100,
      success_count: 1,
      failure_count: 0,
      timestamp: '2024-01-01T00:00:00'
    })

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      // Select a model
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(playgroundAPI.compareModels).toHaveBeenCalled()
      expect(screen.getByText('Results')).toBeInTheDocument()
    })
  })

  it('should handle comparison error', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])
    playgroundAPI.compareModels.mockRejectedValue(new Error('API Error'))

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument()
    })
  })

  it('should clear results on clear button', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      const clearButton = screen.getByText('Clear')
      fireEvent.click(clearButton)
    })

    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('should update temperature', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const tempInput = screen.getByDisplayValue('0.7')
      fireEvent.change(tempInput, { target: { value: '0.5' } })
      expect(tempInput.value).toBe('0.5')
    })
  })

  it('should update max tokens', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const tokensInput = screen.getByDisplayValue('1024')
      fireEvent.change(tokensInput, { target: { value: '2048' } })
      expect(tokensInput.value).toBe('2048')
    })
  })

  it('should show loading state during comparison', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])
    playgroundAPI.compareModels.mockImplementation(
      () => new Promise(() => { }) // Never resolves
    )

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Running comparison...')).toBeInTheDocument()
    })
  })

  it('should display results with statistics', async () => {
    playgroundAPI.getAvailableProviders.mockResolvedValue([])
    playgroundAPI.getAvailableModels.mockResolvedValue([
      {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        display_name: 'Claude 3 Sonnet',
        max_tokens: 4096,
        description: 'Balanced model'
      }
    ])
    playgroundAPI.compareModels.mockResolvedValue({
      prompt: 'Test prompt',
      responses: [
        {
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          content: 'Response',
          latency_ms: 100,
          token_count: 50,
          finish_reason: 'end_turn',
          success: true,
          error: null
        }
      ],
      total_latency_ms: 100,
      success_count: 1,
      failure_count: 0,
      timestamp: '2024-01-01T00:00:00'
    })

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('1 Success')).toBeInTheDocument()
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })
  })
})
