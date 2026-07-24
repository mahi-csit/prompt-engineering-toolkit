import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PromptPreview from '../../components/PromptPreview'

describe('PromptPreview', () => {
  it('should render empty state when no content provided', () => {
    render(<PromptPreview content="" variableValues={{}} />)
    expect(screen.getByText('No content to preview')).toBeInTheDocument()
  })

  it('should render content without variables', () => {
    render(<PromptPreview content="Hello world" variableValues={{}} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('should substitute single variable', () => {
    render(<PromptPreview content="Hello {{name}}" variableValues={{ name: 'Alice' }} />)
    expect(screen.getByText('Hello Alice')).toBeInTheDocument()
  })

  it('should substitute multiple variables', () => {
    render(
      <PromptPreview 
        content="Hello {{name}}, welcome to {{place}}" 
        variableValues={{ name: 'Alice', place: 'Wonderland' }} 
      />
    )
    expect(screen.getByText('Hello Alice, welcome to Wonderland')).toBeInTheDocument()
  })

  it('should show used variables', () => {
    render(<PromptPreview content="Hello {{name}}" variableValues={{ name: 'Alice' }} />)
    expect(screen.getByText('Variables Used (1):')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
  })

  it('should show missing variables', () => {
    render(<PromptPreview content="Hello {{name}}" variableValues={{}} />)
    expect(screen.getByText('Missing Variables (1):')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
  })

  it('should handle variable reuse', () => {
    render(<PromptPreview content="{{name}} says {{name}}" variableValues={{ name: 'Alice' }} />)
    expect(screen.getByText('Alice says Alice')).toBeInTheDocument()
  })

  it('should not substitute missing variables in preview', () => {
    render(
      <PromptPreview 
        content="Hello {{name}}, welcome to {{place}}" 
        variableValues={{ name: 'Alice' }} 
      />
    )
    expect(screen.getByText(/Hello Alice, welcome to/)).toBeInTheDocument()
  })
})
