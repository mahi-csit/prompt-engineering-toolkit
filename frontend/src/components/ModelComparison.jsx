function ModelComparison({ responses }) {
  if (!responses) {
    console.warn('ModelComparison received null/undefined responses')
    return (
      <div className="text-center py-8 text-gray-500">
        No responses to display
      </div>
    )
  }

  if (!Array.isArray(responses)) {
    console.error('ModelComparison received non-array responses:', responses)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
        Error: Response format is invalid (expected array)
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No responses to display
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {responses.map((response, index) => {
        // Validate response structure
        if (!response) {
          return (
            <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-red-700">Invalid response object at index {index}</p>
            </div>
          )
        }

        const isSuccess = Boolean(response.success && (response.response || response.content))
        const displayText = response.response || response.content || response.error || 'No response or error'

        return (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              isSuccess
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {response.model || 'Unknown Model'}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {response.provider || 'Unknown Provider'}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isSuccess
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isSuccess ? 'Success' : 'Failed'}
              </span>
            </div>

            {isSuccess ? (
              <>
                <div className="bg-white border border-gray-200 rounded p-3 mb-3 min-h-[150px] max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {displayText}
                  </pre>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white border border-gray-200 rounded p-2">
                    <p className="text-gray-500 mb-1">Latency</p>
                    <p className="font-semibold text-gray-900">
                      {response.latency_ms || 0}ms
                    </p>
                  </div>
                  {response.token_count && (
                    <div className="bg-white border border-gray-200 rounded p-2">
                      <p className="text-gray-500 mb-1">Tokens</p>
                      <p className="font-semibold text-gray-900">
                        {response.token_count}
                      </p>
                    </div>
                  )}
                  {response.finish_reason && (
                    <div className="bg-white border border-gray-200 rounded p-2">
                      <p className="text-gray-500 mb-1">Finish</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {response.finish_reason}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium">
                  {displayText}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ModelComparison
