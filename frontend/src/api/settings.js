import apiClient from './client'

export const settingsAPI = {
  /**
   * Get settings status (configured API keys)
   */
  async getStatus() {
    const response = await apiClient.get('/api/settings/status')
    return response.data
  },

  /**
   * Update API key in .env file and runtime config
   * @param {Object} data - { provider: 'gemini', api_key: 'AIzaSy...' }
   */
  async updateApiKey(data) {
    const response = await apiClient.post('/api/settings/update-api-key', data)
    return response.data
  },
}
