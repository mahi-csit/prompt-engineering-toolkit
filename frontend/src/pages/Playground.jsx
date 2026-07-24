import { useState, useEffect } from 'react'
import { playgroundAPI } from '../api/playground'
import ModelComparison from '../components/ModelComparison'

function Playground() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [availableProviders, setAvailableProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)

  useEffect(() => {
    fetchModels()
  }, [])

  // const fetchProviders = async () => {
  //   try {
  //     const providers = await playgroundAPI.getAvailableProviders()
  //     setAvailableProviders(providers)
  //     
  //     // Select first provider's default model by default
  //     if (providers.length > 0) {
  //       const firstProvider = providers[0].provider
  //       await fetchModelsByProvider(firstProvider)
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch providers:', err)
  //   }
  // }

  const fetchModels = async () => {
    try {
      const models = await playgroundAPI.getAvailableModels()
      setAvailableModels(models)
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }

  const fetchModelsByProvider = async (provider) => {
    try {
      const models = await playgroundAPI.getModelsByProvider(provider)
      setAvailableModels(models)
      
      // Select first model by default
      if (models.length > 0) {
        setSelectedModels([{
          provider: models[0].provider,
          model: models[0].model,
          temperature: temperature,
          max_tokens: maxTokens
        }])
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

  const handleQuickTest = async () => {
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
      console.log('Starting comparison with models:', selectedModels)
      
      const payload = {
        prompt: prompt,
        models: selectedModels.map(m => ({
          provider: m.provider,
          model: m.model,
          temperature: m.temperature,
          max_tokens: m.max_tokens
        }))
      }
      
      console.log('Payload being sent:', JSON.stringify(payload, null, 2))
      console.log('Payload structure validation:')
      console.log('  - prompt type:', typeof payload.prompt, 'value:', payload.prompt)
      console.log('  - models count:', payload.models.length)
      payload.models.forEach((m, i) => {
        console.log(`  - model[${i}]:`, {
          provider: typeof m.provider,
          model: typeof m.model,
          temperature: typeof m.temperature,
          max_tokens: typeof m.max_tokens,
          values: m
        })
      })
      
      const response = await playgroundAPI.compareModels(payload)

      console.log('Received response:', response)
      
      // Validate response structure
      if (!response) {
        throw new Error('Received null or undefined response from server')
      }

      if (!Array.isArray(response.responses)) {
        console.error('Response format invalid:', response)
        throw new Error('Response.responses is not an array. Received: ' + JSON.stringify(response))
      }

      // Validate each response has required fields
      response.responses.forEach((resp, index) => {
        if (!resp.response && !resp.error) {
          console.error(`Response ${index} missing both response and error fields:`, resp)
          throw new Error(`Response ${index} missing response data`)
        }
      })

      console.log('Response validation passed, setting results')
      setResults(response)
      console.log('Results state updated successfully')
    } catch (err) {
      console.error('Error during comparison:', err)
      console.error('Error stack:', err.stack)
      console.error('Full error object:', JSON.stringify(err, null, 2))
      
      // Log validation details if available
      if (err.data?.detail) {
        console.error('Validation details (data.detail):', err.data.detail)
      }
      
      // Extract user-friendly error message
      const errorMessage = err.message || 'Failed to execute comparison'
      console.error('Displaying error to user:', errorMessage)
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt('')
    setResults(null)
    setError('')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Playground</h1>
        <p className="text-gray-600 mt-1">Test prompts against multiple models simultaneously</p>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="flex gap-3">
              <button
                onClick={handleQuickTest}
                disabled={loading || !prompt.trim() || selectedModels.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Running...' : 'Run Comparison'}
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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
      </div>
  )
}

export default Playground
