import apiClient from './client'

/**
 * Prompts API
 */
export const promptsAPI = {
  /**
   * Create a new prompt
   * @param {Object} promptData - Prompt creation data
   * @returns {Promise<Object>}
   */
  async createPrompt(promptData) {
    const response = await apiClient.post('/api/prompts/', promptData)
    return response.data
  },

  /**
   * Get a prompt by ID
   * @param {number} promptId - Prompt ID
   * @returns {Promise<Object>}
   */
  async getPrompt(promptId) {
    const response = await apiClient.get(`/api/prompts/${promptId}`)
    return response.data
  },

  /**
   * List prompts with search and pagination
   * @param {Object} params - Search and pagination params
   * @returns {Promise<Object>}
   */
  async listPrompts(params = {}) {
    const response = await apiClient.get('/api/prompts/', { params })
    return response.data
  },

  /**
   * Update a prompt
   * @param {number} promptId - Prompt ID
   * @param {Object} promptData - Update data
   * @returns {Promise<Object>}
   */
  async updatePrompt(promptId, promptData) {
    const response = await apiClient.put(`/api/prompts/${promptId}`, promptData)
    return response.data
  },

  /**
   * Delete a prompt
   * @param {number} promptId - Prompt ID
   * @returns {Promise<void>}
   */
  async deletePrompt(promptId) {
    await apiClient.delete(`/api/prompts/${promptId}`)
  },

  /**
   * Render a prompt with variable values
   * @param {Object} renderRequest - Render request with prompt ID and variable values
   * @returns {Promise<Object>}
   */
  async renderPrompt(renderRequest) {
    const response = await apiClient.post('/api/prompts/render', renderRequest)
    return response.data
  },

  /**
   * Get all categories
   * @returns {Promise<Array<string>>}
   */
  async getCategories() {
    const response = await apiClient.get('/api/prompts/categories/list')
    return response.data
  },

  /**
   * Get version history for a prompt
   * @param {number} promptId - Prompt ID
   * @returns {Promise<Array>}
   */
  async getPromptVersions(promptId) {
    const response = await apiClient.get(`/api/prompts/${promptId}/versions`)
    return response.data
  },

  /**
   * Rollback prompt to a specific version
   * @param {number} promptId - Prompt ID
   * @param {number} versionNumber - Version number to rollback to
   * @returns {Promise<Object>}
   */
  async rollbackToVersion(promptId, versionNumber) {
    const response = await apiClient.post(`/api/prompts/${promptId}/versions/${versionNumber}/rollback`)
    return response.data
  },

  /**
   * Export prompt with version history
   * @param {number} promptId - Prompt ID
   * @returns {Promise<Object>}
   */
  async exportPrompt(promptId) {
    const response = await apiClient.get(`/api/prompts/${promptId}/export`)
    return response.data
  },

  /**
   * Import prompt from JSON
   * @param {Object} importData - Import data
   * @returns {Promise<Object>}
   */
  async importPrompt(importData) {
    const response = await apiClient.post('/api/prompts/import', importData)
    return response.data
  },
}
