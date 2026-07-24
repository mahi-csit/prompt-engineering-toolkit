import { useState, useEffect } from 'react'
import { evaluationsAPI } from '../api/evaluations'
import { promptsAPI } from '../api/prompts'

function Evaluator() {
  const [prompts, setPrompts] = useState([])
  const [selectedPromptId, setSelectedPromptId] = useState('')
  const [rubrics, setRubrics] = useState([])
  const [selectedRubric, setSelectedRubric] = useState(null)
  const [loading, setLoading] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('evaluate') // 'evaluate' or 'optimize'

  useEffect(() => {
    fetchPrompts()
    fetchRubrics()
  }, [])

  const fetchPrompts = async () => {
    try {
      const response = await promptsAPI.listPrompts({ page: 1, page_size: 100 })
      setPrompts(response.items)
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
    }
  }

  const fetchRubrics = async () => {
    try {
      const rubricsList = await evaluationsAPI.getDefaultRubrics()
      setRubrics(rubricsList)
      if (rubricsList.length > 0) {
        setSelectedRubric(rubricsList[0])
      }
    } catch (err) {
      console.error('Failed to fetch rubrics:', err)
    }
  }

  const handleEvaluate = async () => {
    if (!selectedPromptId || !selectedRubric) {
      setError('Please select a prompt and rubric')
      return
    }

    setLoading(true)
    setError('')
    setEvaluationResult(null)

    try {
      const result = await evaluationsAPI.evaluatePrompt({
        prompt_id: parseInt(selectedPromptId),
        rubric: selectedRubric,
        model: 'claude-3-sonnet-20240229'
      })
      setEvaluationResult(result)
    } catch (err) {
      setError(err.message || 'Evaluation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    const prompt = prompts.find(p => p.id === parseInt(selectedPromptId))
    if (!prompt) {
      setError('Please select a prompt')
      return
    }

    setLoading(true)
    setError('')
    setEvaluationResult(null)

    try {
      const result = await evaluationsAPI.optimizePrompt({
        prompt: prompt.content,
        goal: 'improve clarity and effectiveness',
        context: 'General prompt optimization'
      })
      setEvaluationResult(result)
    } catch (err) {
      setError(err.message || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prompt Evaluator</h1>
        <p className="text-gray-600 mt-1">Evaluate and optimize your prompts with AI-powered analysis</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'evaluate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Evaluate
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'optimize'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Optimize
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Prompt
            </label>
            <select
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a prompt...</option>
              {prompts.map(prompt => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'evaluate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Rubric
              </label>
              <select
                value={selectedRubric?.name || ''}
                onChange={(e) => {
                  const rubric = rubrics.find(r => r.name === e.target.value)
                  setSelectedRubric(rubric)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rubrics.map(rubric => (
                  <option key={rubric.name} value={rubric.name}>
                    {rubric.name}
                  </option>
                ))}
              </select>
              {selectedRubric && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRubric.description}
                </p>
              )}
            </div>
          )}

          <button
            onClick={activeTab === 'evaluate' ? handleEvaluate : handleOptimize}
            disabled={loading || !selectedPromptId || (activeTab === 'evaluate' && !selectedRubric)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (activeTab === 'evaluate' ? 'Evaluate Prompt' : 'Optimize Prompt')}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {activeTab === 'evaluate' ? 'Evaluating prompt...' : 'Optimizing prompt...'}
              </p>
            </div>
          ) : evaluationResult ? (
            <div className="space-y-4">
              {activeTab === 'evaluate' ? (
                /* Evaluation Results */
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Evaluation Results
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Overall Score</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {evaluationResult.overall_score.toFixed(1)}/100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {evaluationResult.criterion_scores.map((score, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {score.criterion_name}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {score.score}/{evaluationResult.total_possible_score}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {score.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Optimization Results */
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Optimization Results
                  </h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Reasoning</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {evaluationResult.overall_reasoning}
                    </p>
                  </div>

                  {evaluationResult.suggestions.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
                      {evaluationResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                              {suggestion.type}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Original:</p>
                            <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                              {suggestion.original}
                            </p>
                          </div>
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                            <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                              {suggestion.suggested}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600">
                            {suggestion.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Optimized Prompt</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                        {evaluationResult.optimized_prompt}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Select a prompt and click the button to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Evaluator
