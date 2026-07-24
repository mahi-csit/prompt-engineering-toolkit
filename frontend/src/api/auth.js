import apiClient from './client'

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  async signup(userData) {
    const response = await apiClient.post('/api/auth/signup', userData)
    return response.data
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  },

  /**
   * Get current user
   * @returns {Promise<Object>}
   */
  async getMe() {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>}
   */
  async changePassword(passwordData) {
    const response = await apiClient.post('/api/auth/change-password', passwordData)
    return response.data
  },
}
