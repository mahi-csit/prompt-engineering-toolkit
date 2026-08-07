import axios from 'axios'

// Get API URL from environment variable, normalize to prevent double /api paths
let rawURL = (import.meta.env.VITE_API_URL || '').trim()
if (rawURL.endsWith('/')) {
  rawURL = rawURL.slice(0, -1)
}
if (rawURL.endsWith('/api')) {
  rawURL = rawURL.slice(0, -4)
}
const apiURL = rawURL

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: apiURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - can add auth token here in Phase 6
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: null,
        isNetworkError: true,
      })
    }

    // Handle HTTP error status codes
    const { status, data } = error.response

    // Helper function to extract and format validation errors from FastAPI 422 responses
    const extractValidationErrors = (responseData) => {
      if (status === 422 && Array.isArray(responseData?.detail)) {
        // FastAPI validation error format: { detail: [{ loc: [...], msg: "...", type: "..." }, ...] }
        const errors = responseData.detail.map((err) => {
          const field = Array.isArray(err.loc) ? err.loc.join('.') : 'unknown'
          return `${field}: ${err.msg}`
        })
        return errors.join('; ')
      }
      return null
    }

    // Client errors (4xx)
    if (status >= 400 && status < 500) {
      const validationErrors = extractValidationErrors(data)
      const message = validationErrors || data?.detail || data?.message || 'Client error occurred'
      
      return Promise.reject({
        message,
        status,
        data,
        isClientError: true,
      })
    }

    // Server errors (5xx)
    if (status >= 500) {
      return Promise.reject({
        message: data?.detail || data?.message || 'Server error occurred',
        status,
        data,
        isServerError: true,
      })
    }

    // Default error handling
    return Promise.reject({
      message: data?.detail || data?.message || 'An error occurred',
      status,
      data,
    })
  }
)

export default apiClient
