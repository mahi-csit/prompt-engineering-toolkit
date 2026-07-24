import apiClient from './client'

/**
 * Playground API
 */
export const playgroundAPI = {
  /**
   * Compare prompt across multiple models
   * @param {Object} comparisonRequest - Comparison request with prompt and models
   * @returns {Promise<Object>}
   */
  async compareModels(comparisonRequest) {
    const response = await apiClient.post('/api/playground/compare', comparisonRequest)
    return response.data
  },

  /**
   * Quick test against a single model
   * @param {Object} testRequest - Quick test request
   * @returns {Promise<Object>}
   */
  async quickTest(testRequest) {
    const response = await apiClient.post('/api/playground/quick-test', testRequest)
    return response.data
  },

  /**
   * Get all available models
   * @returns {Promise<Array>}
   */
  async getAvailableModels() {
    const response = await apiClient.get('/api/playground/models')
    return response.data
  },

  /**
   * Get models for a specific provider
   * @param {string} provider - Provider name (anthropic or openai)
   * @returns {Promise<Array>}
   */
  async getModelsByProvider(provider) {
    const response = await apiClient.get(`/api/playground/models/${provider}`)
    return response.data
  },

  /**
   * Get available providers
   * @returns {Promise<Array>}
   */
  async getAvailableProviders() {
    const response = await apiClient.get('/api/playground/providers')
    return response.data
  },
}
