import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { promptsAPI } from '../api/prompts'
import { settingsAPI } from '../api/settings'
import PromptPreview from '../components/PromptPreview'

function PromptBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: location.state?.title || '',
    description: location.state?.description || '',
    category: location.state?.category || '',
    content: location.state?.content || '',
  })
  const [variableValues, setVariableValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI Prompt Generator state
  const [generateTopic, setGenerateTopic] = useState('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)

  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [keySavedMsg, setKeySavedMsg] = useState('')
  const [savingKey, setSavingKey] = useState(false)

  const handleSaveApiKey = async (e) => {
    e?.preventDefault()
    const trimmedKey = apiKey.trim()
    setSavingKey(true)
    try {
      if (trimmedKey) {
        localStorage.setItem('gemini_api_key', trimmedKey)
        await settingsAPI.updateApiKey({ provider: 'gemini', api_key: trimmedKey })
        setKeySavedMsg('✓ GEMINI_API_KEY updated in .env file & backend runtime!')
      } else {
        localStorage.removeItem('gemini_api_key')
        await settingsAPI.updateApiKey({ provider: 'gemini', api_key: '' })
        setKeySavedMsg('ℹ️ GEMINI_API_KEY cleared in .env file.')
      }
    } catch (err) {
      console.error('Failed to update .env:', err)
      setKeySavedMsg(trimmedKey ? '✓ Key saved locally (backend sync optional)' : 'ℹ️ Key cleared locally')
    } finally {
      setSavingKey(false)
      setTimeout(() => setKeySavedMsg(''), 4000)
    }
  }

  const handleClearApiKey = async () => {
    setApiKey('')
    localStorage.removeItem('gemini_api_key')
    setSavingKey(true)
    try {
      await settingsAPI.updateApiKey({ provider: 'gemini', api_key: '' })
      setKeySavedMsg('ℹ️ GEMINI_API_KEY cleared in .env file.')
    } catch (err) {
      setKeySavedMsg('ℹ️ Key cleared locally.')
    } finally {
      setSavingKey(false)
      setTimeout(() => setKeySavedMsg(''), 4000)
    }
  }

  useEffect(() => {
    if (location.state?.content) {
      setFormData(prev => ({
        ...prev,
        content: location.state.content,
        name: location.state.title || prev.name,
      }))
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVariableChange = (e) => {
    const { name, value } = e.target
    setVariableValues(prev => ({ ...prev, [name]: value }))
  }

  const extractVariablesFromContent = (content) => {
    if (!content) return []
    const variablePattern = /\{{1,2}(\w+)\}{1,2}/g
    const variables = new Set()
    let match
    while ((match = variablePattern.exec(content)) !== null) {
      variables.add(match[1])
    }
    return Array.from(variables)
  }

  const detectedVariables = extractVariablesFromContent(formData.content)

  const handleGeneratePrompt = async () => {
    if (!generateTopic.trim()) {
      setError('Please enter a topic to generate a prompt')
      return
    }
    setGeneratingPrompt(true)
    setError('')
    try {
      const res = await promptsAPI.generatePrompt({
        topic: generateTopic.trim(),
        category: formData.category || undefined,
      })
      setFormData(prev => ({
        ...prev,
        name: res.title || prev.name,
        category: res.category || prev.category,
        description: res.description || prev.description,
        content: res.content || prev.content,
      }))
    } catch (err) {
      console.error('Failed to generate prompt:', err)
      setError(err.message || 'Failed to generate prompt template')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Please enter a prompt name')
      return
    }
    if (!formData.content.trim()) {
      setError('Please enter prompt content')
      return
    }

    setLoading(true)
    setError('')

    try {
      const autoVariables = {}
      detectedVariables.forEach(v => {
        autoVariables[v] = variableValues[v] || v
      })

      await promptsAPI.createPrompt({
        title: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || 'General',
        content: formData.content,
        variables: autoVariables,
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
        <p className="text-gray-600 mt-2">Build a prompt template manually or generate one instantly with AI</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Gemini API Key Settings Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <h2 className="text-base font-semibold text-amber-950">
              Gemini API Key Configuration
            </h2>
            {apiKey ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                ✓ Key Saved Locally
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                Using Server Environment Key
              </span>
            )}
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
          >
            Get Key from Google AI Studio ↗
          </a>
        </div>
        <p className="text-xs text-amber-800 mb-3">
          Enter your Google AI Studio API key here to change or override the API key used for prompt building and execution.
        </p>

        <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="relative flex-1">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Enter your Gemini API key from Google AI Studio)"
              className="w-full px-3 py-2 pr-10 border border-amber-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs px-1.5 py-1 rounded"
              title={showApiKey ? "Hide Key" : "Show Key"}
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingKey}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {savingKey ? 'Updating .env...' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClearApiKey}
                disabled={savingKey}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
        {keySavedMsg && (
          <p className="text-xs font-medium text-emerald-700 mt-2">
            {keySavedMsg}
          </p>
        )}
      </div>

      {/* AI Prompt Generator Widget */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✨</span>
          <h2 className="text-base font-semibold text-indigo-950">
            Generate Prompt with AI
          </h2>
        </div>
        <p className="text-xs text-indigo-700 mb-3">
          Enter a topic or task (e.g. <em>"Python Code Reviewer"</em>, <em>"Customer Refund Request"</em>, <em>"Welcome Email"</em>) to generate a complete prompt template with variables!
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGeneratePrompt(); } }}
            placeholder="e.g., Python Code Reviewer or Customer Refund Support"
            className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleGeneratePrompt}
            disabled={generatingPrompt || !generateTopic.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            {generatingPrompt ? 'Generating...' : '✨ Generate Prompt'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="name"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this prompt"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                id="category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Support, Coding, Marketing"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Content *
              </label>
              <textarea
                id="content"
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

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-sm"
              >
                {loading ? 'Creating...' : 'Create Prompt'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <PromptPreview
              name={formData.name}
              description={formData.description}
              category={formData.category}
              content={formData.content}
              variableValues={variableValues}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default PromptBuilder
