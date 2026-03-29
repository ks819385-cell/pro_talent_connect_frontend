/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */

import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, you'd send this to an error reporting service)
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-red-400 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Try Again
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
