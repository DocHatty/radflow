import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../services/loggingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging service
    logError('ErrorBoundary', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState({
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
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-base)]">
          <div className="max-w-2xl p-8 bg-[var(--color-panel-bg)] border border-[var(--color-danger-border)] rounded-lg">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-danger-text)] mr-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-[var(--color-danger-text)]">
                Something went wrong
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-[var(--color-text-default)] mb-4">
                We're sorry, but an unexpected error occurred. This has been logged and will be investigated.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-default)] mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="p-4 bg-[var(--color-base)] rounded border border-[var(--color-border)] font-mono text-sm">
                    <div className="mb-2">
                      <strong className="text-[var(--color-danger-text)]">
                        {this.state.error.toString()}
                      </strong>
                    </div>
                    {this.state.error.stack && (
                      <pre className="text-[var(--color-text-muted)] whitespace-pre-wrap overflow-auto max-h-64">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-glow)] text-white rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[var(--color-border)] hover:bg-[var(--color-border-hover)] text-[var(--color-text-default)] rounded transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
