import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PromptBuilder from '../../pages/PromptBuilder'
import { promptsAPI } from '../../api/prompts'

// Mock the prompts API
vi.mock('../../api/prompts')

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('PromptBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderBuilder = () => {
    return render(
      <BrowserRouter>
        <PromptBuilder />
      </BrowserRouter>
    )
  }

  it('should render the form', () => {
    renderBuilder()
    expect(screen.getByText('Create New Prompt')).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prompt Content/)).toBeInTheDocument()
  })

  it('should update form fields on change', () => {
    renderBuilder()
    
    const nameInput = screen.getByLabelText(/Name/)
    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } })
    
    expect(nameInput.value).toBe('Test Prompt')
  })

  it('should detect variables in content', () => {
    renderBuilder()
    
    const contentInput = screen.getByLabelText(/Prompt Content/)
    fireEvent.change(contentInput, { target: { value: 'Hello {{name}}' } })
    
    expect(screen.getByText('Detected Variables:')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
  })

  it('should show variable input fields for detected variables', () => {
    renderBuilder()
    
    const contentInput = screen.getByLabelText(/Prompt Content/)
    fireEvent.change(contentInput, { target: { value: 'Hello {{name}}' } })
    
    const variableInput = screen.getByPlaceholderText(/Enter value for name/)
    expect(variableInput).toBeInTheDocument()
  })

  it('should submit form successfully', async () => {
    promptsAPI.createPrompt.mockResolvedValue({ id: 1 })
    
    renderBuilder()
    
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Prompt Content/), { target: { value: 'Content' } })
    
    fireEvent.click(screen.getByText('Create Prompt'))
    
    await waitFor(() => {
      expect(promptsAPI.createPrompt).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/library')
    })
  })

  it('should show error on submission failure', async () => {
    promptsAPI.createPrompt.mockRejectedValue(new Error('API Error'))
    
    renderBuilder()
    
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Prompt Content/), { target: { value: 'Content' } })
    
    fireEvent.click(screen.getByText('Create Prompt'))
    
    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument()
    })
  })

  it('should navigate to library on cancel', () => {
    renderBuilder()
    
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(mockNavigate).toHaveBeenCalledWith('/library')
  })

  it('should require name and content fields', () => {
    renderBuilder()
    
    const nameInput = screen.getByLabelText(/Name/)
    const contentInput = screen.getByLabelText(/Prompt Content/)
    
    expect(nameInput.required).toBe(true)
    expect(contentInput.required).toBe(true)
  })
})
