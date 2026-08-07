import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Playground from '../../pages/Playground'
import { playgroundAPI } from '../../api/playground'
import { promptsAPI } from '../../api/prompts'

// Mock the playground and prompts APIs
vi.mock('../../api/playground')
vi.mock('../../api/prompts')

describe('Playground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (playgroundAPI.getAvailableProviders) {
      playgroundAPI.getAvailableProviders.mockResolvedValue([])
    }
    playgroundAPI.getAvailableModels.mockResolvedValue([])
  })

  const renderPlayground = () => {
    return render(
      <BrowserRouter>
        <Playground />
      </BrowserRouter>
    )
  }

  it('should render the playground page', () => {
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

  it('should fetch models on mount', async () => {
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
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
      expect(textarea.value).toBe('Test prompt')
    })
  })

  it('should disable run comparison button when prompt is empty', async () => {
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    expect(screen.getByText('Run Comparison')).toBeDisabled()
  })

  it('should disable run comparison button when no models selected', async () => {
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    })

    expect(screen.getByText('Run Comparison')).toBeDisabled()
  })

  it('should run comparison successfully', async () => {
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
      if (!checkbox.checked) {
        fireEvent.click(checkbox)
      }
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
      if (!checkbox.checked) {
        fireEvent.click(checkbox)
      }
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
    playgroundAPI.getAvailableModels.mockResolvedValue([])

    renderPlayground()

    let textarea
    await waitFor(() => {
      textarea = screen.getByPlaceholderText(/Enter your prompt here/)
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
      if (!checkbox.checked) {
        fireEvent.click(checkbox)
      }
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
      if (!checkbox.checked) {
        fireEvent.click(checkbox)
      }
    })

    await waitFor(() => {
      const runButton = screen.getByText('Run Comparison')
      fireEvent.click(runButton)
    })

    await waitFor(() => {
      expect(screen.getByText('1 Success')).toBeInTheDocument()
      expect(screen.getByText('Total: 100ms')).toBeInTheDocument()
    })
  })

  it('should open save to library modal and save prompt', async () => {
    promptsAPI.createPrompt.mockResolvedValue({ id: '1', title: 'Test Save' })

    renderPlayground()

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Enter your prompt here/)
      fireEvent.change(textarea, { target: { value: 'My test prompt content' } })
    })

    const saveButton = screen.getByText(/Save to Library/)
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Save Prompt to Library')).toBeInTheDocument()
    })

    const submitButtons = screen.getAllByRole('button', { name: /Save to Library/i })
    const modalSubmit = submitButtons[submitButtons.length - 1]
    fireEvent.click(modalSubmit)

    await waitFor(() => {
      expect(promptsAPI.createPrompt).toHaveBeenCalledWith(expect.objectContaining({
        content: 'My test prompt content'
      }))
      expect(screen.getByText('Prompt successfully saved to your Library!')).toBeInTheDocument()
    })
  })
})
