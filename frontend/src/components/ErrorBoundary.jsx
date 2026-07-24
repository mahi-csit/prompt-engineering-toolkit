import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    console.error('Error caught by boundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error details:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details className="text-sm text-red-600 mb-4">
            <summary className="cursor-pointer font-medium mb-2">
              Error Details
            </summary>
            <pre className="bg-red-100 p-3 rounded overflow-auto text-xs">
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
