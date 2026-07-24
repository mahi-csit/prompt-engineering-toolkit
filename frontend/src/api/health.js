import apiClient from './client'

/**
 * Health check API
 */
export const healthAPI = {
  /**
   * Check backend health status
   * @returns {Promise<{status: string, service: string, environment: string}>}
   */
  async checkHealth() {
    const response = await apiClient.get('/health')
    return response.data
  },
}
