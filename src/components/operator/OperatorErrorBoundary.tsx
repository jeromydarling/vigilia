/**
 * OperatorErrorBoundary — React error boundary that captures render crashes.
 *
 * WHAT: Catches React component errors and logs to operator error desk.
 * WHERE: Wrapped around App root (or operator layout).
 * WHY: Frontend render crashes are invisible without an error boundary.
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { logOperatorError } from '@/lib/operatorErrorCapture';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class OperatorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logOperatorError({
      source: 'frontend',
      message: error.message,
      stack: error.stack,
      extra: {
        componentStack: errorInfo.componentStack?.slice(0, 1000),
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Something did not render as expected.
              </p>
              <p className="text-xs text-muted-foreground/70 font-mono">
                {this.state.error?.message?.slice(0, 120)}
              </p>
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
