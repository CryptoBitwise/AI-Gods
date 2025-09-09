import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Basic logging; could be sent to a monitoring service
        // eslint-disable-next-line no-console
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        if (this.props.onReset) this.props.onReset();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    <div className="corruption-card">
                        <h2 className="text-2xl font-bold mb-2">Something broke the ritual</h2>
                        <p className="text-divine-100 mb-4">
                            An error occurred while rendering this view.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs bg-slate-900/70 border border-divine-500/20 rounded p-3 overflow-auto max-h-48 mb-4">
                                {String(this.state.error.message || this.state.error.toString())}
                            </pre>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={this.handleReset} className="divine-button">Return to safety</button>
                            <button onClick={() => window.location.reload()} className="glitch-button">Reload page</button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children as JSX.Element;
    }
}

export default ErrorBoundary;
