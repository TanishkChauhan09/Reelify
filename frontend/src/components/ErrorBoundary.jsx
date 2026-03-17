import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('UI error boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
          <h2 style={{ marginBottom: 8 }}>Something broke in the UI.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
