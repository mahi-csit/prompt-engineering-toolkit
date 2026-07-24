import { useState } from 'react'
import { evaluationsAPI } from '../api/evaluations'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'anthropic', label: 'Anthropic Claude' },
]

const MODELS = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
  gemini: ['gemini-pro', 'gemini-1.5-pro'],
  anthropic: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
}

function PromptOptimizer() {
  const [prompt, setPrompt] = useState('')
  const [goal, setGoal] = useState('improve clarity and effectiveness')
  const [context, setContext] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleProviderChange = (e) => {
    const p = e.target.value
    setProvider(p)
    setModel(MODELS[p][0])
  }

  const handleOptimize = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt to optimize'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await evaluationsAPI.optimizePrompt({
        prompt: prompt.trim(),
        goal,
        context: context.trim() || undefined,
        model,
        provider,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Optimization failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result?.optimized_prompt) return
    navigator.clipboard.writeText(result.optimized_prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseOptimized = () => {
    if (result?.optimized_prompt) setPrompt(result.optimized_prompt)
    setResult(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prompt Optimizer</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Improve your prompts with AI — increase clarity, reduce ambiguity, and follow best practices.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Original Prompt</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Prompt *
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              placeholder="Paste your existing prompt here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Optimization Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. improve clarity and reduce ambiguity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Context (optional)
            </label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. This prompt is for a customer support chatbot..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
              <select
                value={provider}
                onChange={handleProviderChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {(MODELS[provider] || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Optimizing...
              </span>
            ) : '✨ Optimize Prompt'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Optimized Result</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
              <p>Analyzing and optimizing your prompt...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Optimized prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Optimized Prompt</span>
                  <button
                    onClick={handleCopy}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                    {result.optimized_prompt}
                  </pre>
                </div>
              </div>

              {/* Changes made */}
              {result.changes_made?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes Made</h3>
                  <ul className="space-y-1">
                    {result.changes_made.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              {result.explanation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    {result.explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUseOptimized}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Use This Prompt
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-center">
              <div className="text-5xl mb-3">✨</div>
              <p className="text-sm">Enter a prompt and click Optimize<br/>to see AI-powered improvements</p>
            </div>
          )}
        </div>
      </div>

      {/* Before / After comparison */}
      {result && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Before / After Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                <span>●</span> Original
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{prompt}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                <span>●</span> Optimized
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{result.optimized_prompt}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptOptimizer
