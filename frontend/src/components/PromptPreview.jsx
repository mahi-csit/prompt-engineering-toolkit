import { useState, useEffect } from 'react'

function PromptPreview({ content, variableValues = {} }) {
  const [renderedContent, setRenderedContent] = useState('')
  const [variablesUsed, setVariablesUsed] = useState([])
  const [missingVariables, setMissingVariables] = useState([])

  useEffect(() => {
    if (!content) {
      setRenderedContent('')
      setVariablesUsed([])
      setMissingVariables([])
      return
    }

    // Simple client-side rendering for preview
    let rendered = content
    const used = []
    const missing = []

    // Extract variables from content
    const variablePattern = /\{\{(\w+)\}\}/g
    let match
    const allVariables = new Set()

    while ((match = variablePattern.exec(content)) !== null) {
      allVariables.add(match[1])
    }

    // Substitute variables
    allVariables.forEach(variable => {
      const placeholder = `{{${variable}}}`
      if (variableValues[variable] !== undefined && variableValues[variable] !== '') {
        rendered = rendered.replace(new RegExp(placeholder, 'g'), variableValues[variable])
        used.push(variable)
      } else {
        missing.push(variable)
      }
    })

    setRenderedContent(rendered)
    setVariablesUsed(used)
    setMissingVariables(missing)
  }, [content, variableValues])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Rendered Preview</h3>
        <div className="bg-gray-50 rounded p-3 min-h-[100px] whitespace-pre-wrap text-sm text-gray-800">
          {renderedContent || 'No content to preview'}
        </div>
      </div>

      {(variablesUsed.length > 0 || missingVariables.length > 0) && (
        <div className="space-y-2">
          {variablesUsed.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-xs font-semibold text-green-800 mb-1">
                Variables Used ({variablesUsed.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {variablesUsed.map(variable => (
                  <span key={variable} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missingVariables.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs font-semibold text-yellow-800 mb-1">
                Missing Variables ({missingVariables.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {missingVariables.map(variable => (
                  <span key={variable} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PromptPreview
