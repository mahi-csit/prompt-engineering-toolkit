import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { promptsAPI } from '../api/prompts'
import PromptPreview from '../components/PromptPreview'

function PromptBuilder() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    content: '',
    variables: '{}',
  })
  const [variableValues, setVariableValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVariableChange = (e) => {
    const { name, value } = e.target
    setVariableValues(prev => ({ ...prev, [name]: value }))
  }

  const extractVariablesFromContent = (content) => {
    const variablePattern = /\{\{(\w+)\}\}/g
    const variables = new Set()
    let match
    while ((match = variablePattern.exec(content)) !== null) {
      variables.add(match[1])
    }
    return Array.from(variables)
  }

  const detectedVariables = extractVariablesFromContent(formData.content)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let variables = {}
      try {
        variables = JSON.parse(formData.variables)
      } catch (err) {
        // If JSON parsing fails, use empty object
        variables = {}
      }

      await promptsAPI.createPrompt({
        ...formData,
        variables,
      })

      navigate('/library')
    } catch (err) {
      setError(err.message || 'Failed to create prompt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Prompt</h1>
        <p className="text-gray-600 mt-2">Build a prompt template with variable placeholders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Customer Support Response"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this prompt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your prompt here. Use {{variable_name}} for placeholders."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{variable_name}}'} syntax for dynamic variables
              </p>
            </div>

            {detectedVariables.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  Detected Variables:
                </p>
                <div className="space-y-2">
                  {detectedVariables.map(variable => (
                    <div key={variable}>
                      <label className="block text-xs text-blue-700 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variableValues[variable] || ''}
                        onChange={(e) => handleVariableChange({ target: { name: variable, value: e.target.value } })}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Enter value for ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Definitions (JSON)
              </label>
              <textarea
                name="variables"
                value={formData.variables}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='{"variable_name": "description"}'
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Prompt'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <PromptPreview content={formData.content} variableValues={variableValues} />
          </div>
        </div>
      </form>
    </div>
  )
}

export default PromptBuilder
