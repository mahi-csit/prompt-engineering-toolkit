import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PromptLibrary from '../../pages/PromptLibrary'
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

describe('PromptLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockPrompts = [
    {
      id: 1,
      name: 'Test Prompt 1',
      description: 'Description 1',
      category: 'Support',
      tags: 'tag1,tag2',
      version_number: 1,
      updated_at: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      name: 'Test Prompt 2',
      description: 'Description 2',
      category: 'Sales',
      tags: 'tag3',
      version_number: 2,
      updated_at: '2024-01-02T00:00:00',
    },
  ]

  const renderLibrary = () => {
    return render(
      <BrowserRouter>
        <PromptLibrary />
      </BrowserRouter>
    )
  }

  it('should render the library page', () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: [], total: 0 })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    expect(screen.getByText('Prompt Library')).toBeInTheDocument()
    expect(screen.getByText('Create New Prompt')).toBeInTheDocument()
  })

  it('should display prompts', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: mockPrompts, total: 2 })
    promptsAPI.getCategories.mockResolvedValue(['Support', 'Sales'])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument()
      expect(screen.getByText('Test Prompt 2')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    promptsAPI.listPrompts.mockImplementation(() => new Promise(() => { }))
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    expect(screen.getByText('Loading prompts...')).toBeInTheDocument()
  })

  it('should show empty state when no prompts', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: [], total: 0 })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText(/No prompts found/)).toBeInTheDocument()
    })
  })

  it('should handle search', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: mockPrompts, total: 2 })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    await waitFor(() => {
      expect(promptsAPI.listPrompts).toHaveBeenCalled()
    })

    const searchInput = screen.getByPlaceholderText(/Search by name or description/)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    fireEvent.click(screen.getByText('Search'))

    await waitFor(() => {
      expect(promptsAPI.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'test' })
      )
    })
  })

  it('should load categories', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: [], total: 0 })
    promptsAPI.getCategories.mockResolvedValue(['Support', 'Sales'])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Sales')).toBeInTheDocument()
    })
  })

  it('should filter by category', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: mockPrompts, total: 2 })
    promptsAPI.getCategories.mockResolvedValue(['Support', 'Sales'])

    renderLibrary()

    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue(/All Categories/)
      expect(categorySelect).toBeInTheDocument()
    })

    const categorySelect = screen.getByDisplayValue(/All Categories/)
    fireEvent.change(categorySelect, { target: { value: 'Support' } })

    await waitFor(() => {
      expect(promptsAPI.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Support' })
      )
    })
  })

  it('should navigate to builder on create button click', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: [], total: 0 })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    fireEvent.click(screen.getByText('Create New Prompt'))

    expect(mockNavigate).toHaveBeenCalledWith('/builder')
  })

  it('should delete prompt on confirmation', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: mockPrompts, total: 2 })
    promptsAPI.getCategories.mockResolvedValue([])
    promptsAPI.deletePrompt.mockResolvedValue()

    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(promptsAPI.deletePrompt).toHaveBeenCalledWith(1)
      expect(promptsAPI.listPrompts).toHaveBeenCalled() // Refresh after delete
    })
  })

  it('should not delete prompt on cancel', async () => {
    promptsAPI.listPrompts.mockResolvedValue({ items: mockPrompts, total: 2 })
    promptsAPI.getCategories.mockResolvedValue([])
    promptsAPI.deletePrompt.mockResolvedValue()

    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false)

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(promptsAPI.deletePrompt).not.toHaveBeenCalled()
  })

  it('should display error message', async () => {
    promptsAPI.listPrompts.mockRejectedValue(new Error('API Error'))
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument()
    })
  })

  it('should display pagination when multiple pages', async () => {
    promptsAPI.listPrompts.mockResolvedValue({
      items: mockPrompts,
      total: 40,
      page: 1,
      page_size: 20
    })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  it('should navigate to next page', async () => {
    promptsAPI.listPrompts.mockResolvedValue({
      items: mockPrompts,
      total: 40,
      page: 1,
      page_size: 20
    })
    promptsAPI.getCategories.mockResolvedValue([])

    renderLibrary()

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(promptsAPI.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })
  })
})
