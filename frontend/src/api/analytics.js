import apiClient from './client'

/**
 * Analytics API
 */
export const analyticsAPI = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    const response = await apiClient.get('/api/analytics/dashboard')
    return response.data
  },

  /**
   * Get prompt usage statistics
   * @param {number} limit - Maximum number of prompts to return
   * @returns {Promise<Array>}
   */
  async getPromptUsageStats(limit = 10) {
    const response = await apiClient.get('/api/analytics/prompt-usage', { params: { limit } })
    return response.data
  },
}
