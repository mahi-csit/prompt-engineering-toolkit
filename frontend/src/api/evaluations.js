import apiClient from './client'

/**
 * Evaluations API
 */
export const evaluationsAPI = {
  /**
   * Evaluate a prompt using a rubric
   * @param {Object} evaluationRequest - Evaluation request with prompt ID and rubric
   * @returns {Promise<Object>}
   */
  async evaluatePrompt(evaluationRequest) {
    const response = await apiClient.post('/api/evaluations/evaluate', evaluationRequest)
    return response.data
  },

  /**
   * Optimize a prompt with AI suggestions
   * @param {Object} optimizationRequest - Optimization request with prompt and goal
   * @returns {Promise<Object>}
   */
  async optimizePrompt(optimizationRequest) {
    const response = await apiClient.post('/api/evaluations/optimize', optimizationRequest)
    return response.data
  },

  /**
   * Get default evaluation rubrics
   * @returns {Promise<Array>}
   */
  async getDefaultRubrics() {
    const response = await apiClient.get('/api/evaluations/rubrics/default')
    return response.data.rubrics
  },

  /**
   * Get a specific default rubric by name
   * @param {string} rubricName - Name of the rubric
   * @returns {Promise<Object>}
   */
  async getDefaultRubric(rubricName) {
    const response = await apiClient.get(`/api/evaluations/rubrics/default/${rubricName}`)
    return response.data
  },
}
