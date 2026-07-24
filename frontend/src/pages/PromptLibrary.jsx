import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { promptsAPI } from '../api/prompts'

function PromptLibrary() {
  const navigate = useNavigate()
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  })
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [selectedPromptVersions, setSelectedPromptVersions] = useState([])
  const [selectedPromptId, setSelectedPromptId] = useState(null)

  const fetchPrompts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await promptsAPI.listPrompts({
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        page: pagination.page,
        page_size: pagination.page_size,
      })

      setPrompts(response.items)
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }))
    } catch (err) {
      setError(err.message || 'Failed to fetch prompts')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const cats = await promptsAPI.getCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  useEffect(() => {
    fetchPrompts()
    fetchCategories()
  }, [searchQuery, selectedCategory, pagination.page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDelete = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      await promptsAPI.deletePrompt(promptId)
      fetchPrompts()
    } catch (err) {
      setError(err.message || 'Failed to delete prompt')
    }
  }

  const handleViewVersions = async (promptId) => {
    try {
      const versions = await promptsAPI.getPromptVersions(promptId)
      setSelectedPromptVersions(versions)
      setSelectedPromptId(promptId)
      setShowVersionModal(true)
    } catch (err) {
      setError(err.message || 'Failed to fetch versions')
    }
  }

  const handleRollback = async (versionNumber) => {
    if (!window.confirm(`Rollback to version ${versionNumber}? This will create a new version.`)) {
      return
    }

    try {
      await promptsAPI.rollbackToVersion(selectedPromptId, versionNumber)
      setShowVersionModal(false)
      fetchPrompts()
    } catch (err) {
      setError(err.message || 'Failed to rollback')
    }
  }

  const handleExport = async (promptId) => {
    try {
      const exportData = await promptsAPI.exportPrompt(promptId)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt_${promptId}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to export prompt')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const content = await file.text()
        const importData = JSON.parse(content)
        await promptsAPI.importPrompt(importData)
        fetchPrompts()
      } catch (err) {
        setError(err.message || 'Failed to import prompt')
      }
    }
    input.click()
  }

  const totalPages = Math.ceil(pagination.total / pagination.page_size)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
          <p className="text-gray-600 mt-1">Manage and search your prompt templates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/builder')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Prompt
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Import
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Prompts List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No prompts found. Create your first prompt!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map(prompt => (
            <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                  {prompt.name}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                  v{prompt.version_number}
                </span>
              </div>
              
              {prompt.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {prompt.description}
                </p>
              )}

              {prompt.category && (
                <div className="mb-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {prompt.category}
                  </span>
                </div>
              )}

              {prompt.tags && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {prompt.tags.split(',').map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400 mb-3">
                Updated: {new Date(prompt.updated_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100"
                >
                  View
                </button>
                <button
                  onClick={() => handleViewVersions(prompt.id)}
                  className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-sm hover:bg-purple-100"
                >
                  History
                </button>
                <button
                  onClick={() => handleExport(prompt.id)}
                  className="px-3 py-1.5 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                >
                  Export
                </button>
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedPromptVersions.map((version) => (
                <div key={version.id} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">
                      Version {version.version_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded mb-2 max-h-[100px] overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {version.content.substring(0, 200)}
                      {version.content.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      by {version.created_by || 'Unknown'}
                    </span>
                    {version.version_number !== selectedPromptVersions[0].version_number && (
                      <button
                        onClick={() => handleRollback(version.version_number)}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                      >
                        Rollback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptLibrary
