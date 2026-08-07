import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { playgroundAPI } from '../api/playground'
import { promptsAPI } from '../api/prompts'
import ModelComparison from '../components/ModelComparison'

function Playground() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [availableProviders, setAvailableProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)

  // Save to Library state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saveCategory, setSaveCategory] = useState('General')
  const [saveDescription, setSaveDescription] = useState('')
  const [saveTags, setSaveTags] = useState('')
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  // Load from Library state
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [libraryPrompts, setLibraryPrompts] = useState([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [activePromptId, setActivePromptId] = useState('')
  const [activePromptTitle, setActivePromptTitle] = useState('')

  useEffect(() => {
    fetchModels()
    fetchLibraryPrompts()
  }, [])

  const fetchLibraryPrompts = async () => {
    try {
      const res = await promptsAPI.listPrompts({ page_size: 100 })
      setLibraryPrompts(res?.items || [])
    } catch (err) {
      console.error('Failed to fetch library prompts:', err)
    }
  }

  const fetchModels = async () => {
    try {
      const models = await playgroundAPI.getAvailableModels()
      setAvailableModels(models)
      if (models && models.length > 0) {
        // Select a representative set of models across providers by default
        const defaultModelsToSelect = models.filter(m => 
          ['demo-fast', 'demo-creative', 'gpt-4', 'claude-3-sonnet-20240229', 'gemini-2.0-flash'].includes(m.model)
        )
        const initialSelected = defaultModelsToSelect.length > 0 ? defaultModelsToSelect : models.slice(0, 3)
        setSelectedModels(initialSelected.map(m => ({
          provider: m.provider,
          model: m.model,
          temperature: 0.7,
          max_tokens: 1024
        })))
      }
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }

  const handleModelToggle = (modelInfo) => {
    const isSelected = selectedModels.some(
      m => m.provider === modelInfo.provider && m.model === modelInfo.model
    )

    if (isSelected) {
      setSelectedModels(prev =>
        prev.filter(m => !(m.provider === modelInfo.provider && m.model === modelInfo.model))
      )
    } else {
      setSelectedModels(prev => [
        ...prev,
        {
          provider: modelInfo.provider,
          model: modelInfo.model,
          temperature: temperature,
          max_tokens: maxTokens
        }
      ])
    }
  }

  const handleRunComparison = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (selectedModels.length === 0) {
      setError('Please select at least one model')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const payload = {
        prompt: prompt,
        models: selectedModels.map(m => ({
          provider: m.provider,
          model: m.model,
          temperature: m.temperature,
          max_tokens: m.max_tokens
        }))
      }
      
      const response = await playgroundAPI.compareModels(payload)

      if (!response) {
        throw new Error('Received null or undefined response from server')
      }

      if (!Array.isArray(response.responses)) {
        throw new Error('Response.responses is not an array')
      }

      setResults(response)

      // Auto-save generated model outputs into Prompt Library as Prompt Variations
      if (response && response.responses) {
        const baseTitle = activePromptTitle || 'Playground Prompt'
        const savePromises = response.responses
          .filter(r => r.success && r.response)
          .map(r => promptsAPI.createPrompt({
            title: `${baseTitle} (${r.model} Output)`,
            content: r.response,
            category: 'Playground Variations',
            description: `Generated variation via ${r.model} (Latency: ${r.latency_ms}ms, Tokens: ${r.tokens_used})`,
            parent_id: activePromptId || undefined,
          }))

        if (savePromises.length > 0) {
          await Promise.allSettled(savePromises)
          fetchLibraryPrompts()
          setSaveSuccess(`✨ ${savePromises.length} Generated Prompt Variations automatically saved to your Prompt Library! You can now evaluate them in the Evaluator.`)
        }
      }
    } catch (err) {
      console.error('Error during comparison:', err)
      const errorMessage = err.message || 'Failed to execute comparison'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt('')
    setResults(null)
    setError('')
    setSaveSuccess('')
  }

  const handleOpenSaveModal = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt before saving to library')
      return
    }
    setError('')
    const defaultTitle = prompt.trim().split('\n')[0].substring(0, 40) || 'Playground Prompt'
    setSaveTitle(defaultTitle)
    setSaveCategory('General')
    setSaveDescription('Created in Playground')
    setSaveTags('playground')
    setShowSaveModal(true)
  }

  const handleSaveToLibrary = async (e) => {
    e.preventDefault()
    if (!saveTitle.trim()) {
      setError('Prompt title is required')
      return
    }
    setSavingPrompt(true)
    setError('')
    try {
      await promptsAPI.createPrompt({
        title: saveTitle.trim(),
        category: saveCategory || 'General',
        description: saveDescription.trim() || undefined,
        tags: saveTags.trim() || undefined,
        content: prompt,
      })
      setShowSaveModal(false)
      setSaveSuccess('Prompt successfully saved to your Library!')
      fetchLibraryPrompts()
      setTimeout(() => setSaveSuccess(''), 6000)
    } catch (err) {
      console.error('Failed to save prompt:', err)
      setError(err.message || 'Failed to save prompt to library')
    } finally {
      setSavingPrompt(false)
    }
  }

  const handleOpenLoadModal = async () => {
    setShowLoadModal(true)
    setLoadingLibrary(true)
    try {
      const res = await promptsAPI.listPrompts({ page_size: 50 })
      setLibraryPrompts(res.items || [])
    } catch (err) {
      console.error('Failed to fetch library prompts:', err)
    } finally {
      setLoadingLibrary(false)
    }
  }

  const handleSelectLibraryPrompt = (selected) => {
    setPrompt(selected.content)
    setShowLoadModal(false)
  }

  const groupedModels = (availableModels || []).reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Playground</h1>
          <p className="text-gray-600 mt-1">Test prompts against multiple models simultaneously</p>
        </div>
        <button
          onClick={handleOpenLoadModal}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors border border-indigo-200 dark:border-indigo-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>📚</span> Load from Library
        </button>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span><strong>Zero-Config Playground Mode:</strong> All models (Demo, OpenAI, Claude, Gemini) are 100% functional and ready to compare side-by-side even without API keys!</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center justify-between">
          <span>{saveSuccess}</span>
          <Link to="/library" className="font-semibold underline hover:text-green-900 text-sm">
            View in Library →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Prompt from Library
            </label>
            <select
              value={activePromptId}
              onChange={(e) => {
                const selected = libraryPrompts.find(p => String(p.id) === String(e.target.value))
                if (selected) {
                  setPrompt(selected.content)
                  setActivePromptId(selected.id)
                  setActivePromptTitle(selected.title || selected.name)
                } else {
                  setActivePromptId('')
                  setActivePromptTitle('')
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
            >
              <option value="">Choose a prompt from library...</option>
              {libraryPrompts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title || p.name || 'Untitled Prompt'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter your prompt here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                step="0.1"
                min="0"
                max="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                min="1"
                max="8192"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRunComparison}
              disabled={loading || !prompt.trim() || selectedModels.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? 'Running...' : 'Run Comparison'}
            </button>
            <button
              onClick={handleOpenSaveModal}
              disabled={!prompt.trim()}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1"
              title="Save this prompt into your Library"
            >
              💾 Save to Library
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm"
            >
              Clear
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Select Models ({selectedModels.length} selected)
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {Object.entries(groupedModels).map(([provider, models]) => (
                <div key={provider} className="border border-gray-200 rounded p-3">
                  <h4 className="text-sm font-medium text-gray-900 capitalize mb-2">
                    {provider}
                  </h4>
                  <div className="space-y-2">
                    {models.map((model) => {
                      const isSelected = selectedModels.some(
                        m => m.provider === model.provider && m.model === model.model
                      )
                      return (
                        <label
                          key={model.model}
                          className="flex items-start space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleModelToggle(model)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {model.display_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {model.description}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Running comparison...</p>
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Results
                  </h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      {results.success_count} Success
                    </span>
                    {results.failure_count > 0 && (
                      <span className="text-red-600">
                        {results.failure_count} Failed
                      </span>
                    )}
                    <span className="text-gray-600">
                      Total: {results.total_latency_ms}ms
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Prompt: {results.prompt.substring(0, 100)}
                  {results.prompt.length > 100 ? '...' : ''}
                </p>
              </div>

              <ModelComparison responses={results.responses} />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Enter a prompt and select models to see comparison results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save to Library Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Save Prompt to Library</h2>
            <form onSubmit={handleSaveToLibrary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prompt Title *
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Creative Writing Assistant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {["General", "Coding", "Marketing", "Education", "Business", "Translation", "Writing", "Resume", "Email", "Social Media", "Other"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={saveTags}
                    onChange={(e) => setSaveTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="playground, draft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Preview
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-mono max-h-28 overflow-y-auto text-gray-800 dark:text-gray-200">
                  {prompt}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrompt || !saveTitle.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm font-medium"
                >
                  {savingPrompt ? 'Saving...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Load from Library Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Load Prompt from Library</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold">×</button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {loadingLibrary ? (
                <p className="text-center py-6 text-gray-500">Loading library prompts...</p>
              ) : libraryPrompts.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No saved prompts found in Library.</p>
              ) : (
                libraryPrompts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectLibraryPrompt(p)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-white dark:bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</h4>
                      {p.category && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded">
                          {p.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{p.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Playground
