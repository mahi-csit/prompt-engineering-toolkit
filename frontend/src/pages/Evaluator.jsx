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

  const [batchResults, setBatchResults] = useState(null)

  const handleEvaluate = async () => {
    if (!selectedPromptId || !selectedRubric) {
      setError('Please select a prompt and rubric')
      return
    }

    setLoading(true)
    setError('')
    setEvaluationResult(null)
    setBatchResults(null)

    try {
      if (selectedPromptId === 'ALL') {
        // Collect all main prompts AND nested variations
        const allItemsToEvaluate = []
        prompts.forEach(p => {
          allItemsToEvaluate.push({ id: p.id, title: p.title || p.name, content: p.content, type: 'Main Template' })
          if (p.variations && p.variations.length > 0) {
            p.variations.forEach((v, idx) => {
              allItemsToEvaluate.push({
                id: p.id, // reference parent ID
                title: v.title || `${p.title || p.name} (Variation ${idx + 1})`,
                content: v.content,
                type: 'Playground Variation'
              })
            })
          }
        })

        const evalPromises = allItemsToEvaluate.map(item =>
          evaluationsAPI.evaluatePrompt({
            prompt_id: item.id,
            rubric: selectedRubric,
            model: 'claude-3-sonnet-20240229'
          }).then(res => ({
            promptItem: item,
            eval: res
          }))
        )

        const results = await Promise.all(evalPromises)
        results.sort((a, b) => (b.eval.overall_score || 0) - (a.eval.overall_score || 0))
        setBatchResults(results)
      } else {
        const result = await evaluationsAPI.evaluatePrompt({
          prompt_id: selectedPromptId,
          rubric: selectedRubric,
          model: 'claude-3-sonnet-20240229'
        })
        setEvaluationResult(result)
      }
    } catch (err) {
      setError(err.message || 'Evaluation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    const prompt = prompts.find(p => String(p.id) === String(selectedPromptId))
    if (!prompt) {
      setError('Please select a prompt')
      return
    }

    setLoading(true)
    setError('')
    setEvaluationResult(null)
    setBatchResults(null)

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
        <p className="text-gray-600 mt-1">Evaluate and score prompts and generated variations with AI analysis</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Choose a prompt from library...</option>
              {prompts.length > 1 && (
                <option value="ALL">⚡ EVALUATE ALL PROMPTS & VARIATIONS ({prompts.length} Prompts)</option>
              )}
              {prompts.map(prompt => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title || prompt.name || 'Untitled Prompt'}
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
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Evaluating Scores...' : (selectedPromptId === 'ALL' ? '⚡ Batch Evaluate All' : (activeTab === 'evaluate' ? 'Evaluate Prompt' : 'Optimize Prompt'))}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                {selectedPromptId === 'ALL' ? 'Evaluating all prompts and generated variations in batch...' : 'Analyzing and scoring prompt...'}
              </p>
            </div>
          ) : batchResults ? (
            /* Batch Evaluation Results Leaderboard Table */
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    🏆 Prompt Evaluation & Comparison Leaderboard
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Evaluated and scored {batchResults.length} prompts & variations across quality metrics
                  </p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                  {batchResults.length} Evaluated
                </span>
              </div>

              {/* 👑 Winner / Best Prompt Highlight Banner */}
              {batchResults.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border-2 border-amber-400 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👑</span>
                      <div>
                        <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                          #1 BEST PROMPT WINNER
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">
                          {batchResults[0].promptItem.title}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-amber-800 font-medium block">Highest Score</span>
                      <p className="text-2xl font-black text-amber-700 font-mono">
                        {batchResults[0].eval.overall_score?.toFixed(1)} / 100
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-lg p-2.5 text-xs font-mono text-gray-800 line-clamp-3">
                    {batchResults[0].promptItem.content}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Prompt Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Overall Score</th>
                      <th className="p-3">Clarity</th>
                      <th className="p-3">Specificity</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batchResults.map((item, idx) => (
                      <tr key={idx} className={idx === 0 ? "bg-amber-50/60 font-medium" : "hover:bg-blue-50/50 transition-colors"}>
                        <td className="p-3 font-bold text-gray-700">
                          {idx === 0 ? '👑 #1' : `#${idx + 1}`}
                        </td>
                        <td className="p-3 font-medium text-gray-900 max-w-[200px] truncate">
                          {item.promptItem.title}
                        </td>
                        <td className="p-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${item.promptItem.type === 'Main Template' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {item.promptItem.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold px-2 py-0.5 rounded border text-xs ${idx === 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {item.eval.overall_score?.toFixed(1)}/100
                          </span>
                        </td>
                        <td className="p-3 text-gray-700 font-mono">{item.eval.clarity}/10</td>
                        <td className="p-3 text-gray-700 font-mono">{item.eval.specificity}/10</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedPromptId(item.promptItem.id)
                              setEvaluationResult(item.eval)
                              setBatchResults(null)
                            }}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                          >
                            View Scores
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : evaluationResult ? (
            <div className="space-y-4">
              {activeTab === 'evaluate' ? (
                /* Individual Evaluation Results Scorecard */
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Evaluation Scorecard
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
                      Model: {evaluationResult.model_name || 'Standard Evaluator'}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Overall Quality Score</span>
                      <p className="text-3xl font-extrabold text-blue-900 mt-1">
                        {evaluationResult.overall_score?.toFixed(1)} / 100
                      </p>
                    </div>
                  </div>

                  {/* Individual Criteria Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Clarity</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.clarity}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Specificity</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.specificity}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Context</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.context_score}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Grammar</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.grammar}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Completeness</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.completeness}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <span className="text-xs text-gray-500 font-medium">Creativity</span>
                      <p className="text-lg font-bold text-gray-800 font-mono">{evaluationResult.creativity}/10</p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  {evaluationResult.strengths?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-green-800 mb-1">Key Strengths</h4>
                      <ul className="list-disc list-inside text-xs text-green-800 space-y-1">
                        {evaluationResult.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluationResult.weaknesses?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                        {evaluationResult.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluationResult.suggestions?.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-blue-800 mb-1">Actionable Suggestions</h4>
                      <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                        {evaluationResult.suggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                      {evaluationResult.explanation || evaluationResult.overall_reasoning}
                    </p>
                  </div>

                  {evaluationResult.changes_made?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Changes Made</h4>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        {evaluationResult.changes_made.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Optimized Prompt</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
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
                Select a prompt or ⚡ ALL PROMPTS & VARIATIONS to compute scores
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Evaluator
