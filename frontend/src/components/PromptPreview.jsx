import { useState, useEffect } from 'react'
import { playgroundAPI } from '../api/playground'

function PromptPreview({ name, description, category, content, variableValues = {} }) {
  const [renderedContent, setRenderedContent] = useState('')
  const [variablesUsed, setVariablesUsed] = useState([])
  const [missingVariables, setMissingVariables] = useState([])
  const [modelOutput, setModelOutput] = useState('')
  const [loadingOutput, setLoadingOutput] = useState(false)

  useEffect(() => {
    if (!content) {
      setRenderedContent('')
      setVariablesUsed([])
      setMissingVariables([])
      setModelOutput('')
      return
    }

    let rendered = content
    const used = []
    const missing = []

    const variablePattern = /\{{1,2}(\w+)\}{1,2}/g
    let match
    const allVariables = new Set()

    while ((match = variablePattern.exec(content)) !== null) {
      allVariables.add(match[1])
    }

    allVariables.forEach(variable => {
      const val = variableValues[variable]
      if (val !== undefined && val !== '') {
        rendered = rendered.split(`{{${variable}}}`).join(val)
        rendered = rendered.split(`{${variable}}`).join(val)
        used.push(variable)
      } else {
        missing.push(variable)
      }
    })

    setRenderedContent(rendered)
    setVariablesUsed(used)
    setMissingVariables(missing)
  }, [content, variableValues])

  const handleTestOutput = async () => {
    if (!renderedContent.trim()) return
    setLoadingOutput(true)
    try {
      const res = await playgroundAPI.quickTest({
        prompt: renderedContent,
        provider: 'mock',
        model: 'demo-fast',
        temperature: 0.7,
        max_tokens: 1024,
      })
      setModelOutput(res.response || res.content || 'No response generated')
    } catch (err) {
      console.error('Failed to run test output:', err)
      setModelOutput('Error generating response: ' + (err.message || 'Unknown error'))
    } finally {
      setLoadingOutput(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Complete Assembled Prompt Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Prompt Preview</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {name || 'Untitled Prompt'}
            </h3>
          </div>
          {category && (
            <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full">
              {category}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            {description}
          </p>
        )}

        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Rendered Final Prompt (With Variables Substituted)
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[120px] whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
            {renderedContent || 'No content to preview'}
          </div>
        </div>

        {/* Variable Usage Badges */}
        {(variablesUsed.length > 0 || missingVariables.length > 0) && (
          <div className="space-y-2 pt-1">
            {variablesUsed.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                  Variables Used ({variablesUsed.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {variablesUsed.map(v => (
                    <span key={v} className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingVariables.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Missing Variables ({missingVariables.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingVariables.map(v => (
                    <span key={v} className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Model Output Test Button */}
        {renderedContent && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                AI Model Output Test
              </h4>
              <button
                type="button"
                onClick={handleTestOutput}
                disabled={loadingOutput}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-xs font-medium transition-colors border border-indigo-200 dark:border-indigo-700 flex items-center gap-1"
              >
                {loadingOutput ? 'Running...' : '⚡ Test Response'}
              </button>
            </div>
            {modelOutput && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-lg p-3 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {modelOutput}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptPreview
