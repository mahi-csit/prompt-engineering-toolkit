function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Enterprise Prompt Engineering Toolkit
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A production-grade platform for creating, testing, versioning, evaluating, 
          and comparing LLM prompts across multiple model providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prompt Builder</h3>
          <p className="text-gray-600">
            Create and manage prompt templates with variable substitution and live preview.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Playground</h3>
          <p className="text-gray-600">
            Test prompts against multiple models simultaneously with side-by-side comparison.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluator</h3>
          <p className="text-gray-600">
            Evaluate prompt quality with configurable rubrics and automated scoring.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <p className="text-blue-800 text-sm">
          <strong>Status:</strong> Phase 1 Foundation complete. More features coming in subsequent phases.
        </p>
      </div>
    </div>
  )
}

export default HomePage
