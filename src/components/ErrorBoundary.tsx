import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onReset?: () => void;
  resetKey?: string | number;
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare state: ErrorBoundaryState;
  declare setState: (
    state:
      | ErrorBoundaryState
      | Partial<ErrorBoundaryState>
      | ((prevState: Readonly<ErrorBoundaryState>, props: Readonly<ErrorBoundaryProps>) => ErrorBoundaryState | Partial<ErrorBoundaryState> | null),
    callback?: () => void
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[UI ErrorBoundary]', error.message, info.componentStack?.split('\n')[1] || '');
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className={`${
          this.props.compact ? 'p-6 my-4' : 'min-h-[45vh] p-8 my-8 max-w-lg mx-auto'
        } bg-white rounded-3xl border border-red-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4`}
        role="alert"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-sans font-bold text-lg text-gray-900">
            {this.props.title || 'Something went wrong loading this view'}
          </h3>
          <p className="text-xs text-gray-600 max-w-md">
            {this.props.description || this.state.errorMessage || 'A temporary issue prevented this panel from rendering.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 min-h-[44px] rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          {!this.props.compact && (
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-5 py-2.5 min-h-[44px] rounded-xl cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
