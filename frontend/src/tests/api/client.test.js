import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../../api/client'

// Simple mock for localStorage if needed in test environment
const mockStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

if (typeof localStorage === 'undefined' || !localStorage) {
  globalThis.localStorage = mockStorage
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Configuration', () => {
    it('should be configured with correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBeDefined()
    })

    it('should have timeout configured', () => {
      expect(apiClient.defaults.timeout).toBe(30000)
    })

    it('should have JSON content-type header', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('Request Interceptor', () => {
    it('should add auth token from localStorage when available', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      const mockConfig = { headers: {} }
      const requestInterceptor = apiClient.interceptors.request.handlers[0]
      const result = requestInterceptor.fulfilled(mockConfig)
      
      expect(result.headers.Authorization).toBe('Bearer test-token')
      
      localStorage.removeItem('auth_token')
    })

    it('should not add auth token when not available', async () => {
      localStorage.removeItem('auth_token')
      
      const mockConfig = { headers: {} }
      const requestInterceptor = apiClient.interceptors.request.handlers[0]
      const result = requestInterceptor.fulfilled(mockConfig)
      
      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('Response Interceptor', () => {
    it('should handle network errors correctly', async () => {
      const networkError = new Error('Network Error')
      networkError.response = undefined
      
      const responseInterceptor = apiClient.interceptors.response.handlers[0]
      const result = await responseInterceptor.rejected(networkError).catch(e => e)
      
      expect(result.isNetworkError).toBe(true)
      expect(result.message).toContain('Network error')
    })

    it('should handle 4xx client errors', async () => {
      const clientError = {
        response: {
          status: 400,
          data: { detail: 'Bad request' }
        }
      }
      
      const responseInterceptor = apiClient.interceptors.response.handlers[0]
      const result = await responseInterceptor.rejected(clientError).catch(e => e)
      
      expect(result.isClientError).toBe(true)
      expect(result.status).toBe(400)
      expect(result.message).toBe('Bad request')
    })

    it('should handle 5xx server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' }
        }
      }
      
      const responseInterceptor = apiClient.interceptors.response.handlers[0]
      const result = await responseInterceptor.rejected(serverError).catch(e => e)
      
      expect(result.isServerError).toBe(true)
      expect(result.status).toBe(500)
      expect(result.message).toBe('Internal server error')
    })
  })
})
