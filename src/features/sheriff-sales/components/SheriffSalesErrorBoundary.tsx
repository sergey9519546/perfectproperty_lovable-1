import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';
import { captureBoundaryCrash } from '@/lib/error-monitor';

export interface SheriffSalesErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
  componentName?: string;
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class SheriffSalesErrorBoundary extends Component<SheriffSalesErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureBoundaryCrash(error, {
      boundary: 'SheriffSalesErrorBoundary',
      componentName: this.props.componentName || 'SheriffSalesDashboard',
      componentStack: errorInfo.componentStack || undefined,
      metadata: {
        fallbackTitle: this.props.fallbackTitle,
        compact: this.props.compact,
      },
    });
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.compact) {
        return (
          <div
            role="alert"
            className="flex items-center justify-between p-3.5 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {this.props.fallbackTitle || 'Unable to compute underwriting score for this docket.'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleReset}
              className="h-7 px-2.5 text-[11px] border-destructive/30 hover:bg-destructive/10"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        );
      }

      return (
        <Card className="border-destructive/40 bg-destructive/5 shadow-xs my-4" role="alert">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-destructive font-mono font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>Dashboard Module Recovery</span>
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">
              {this.props.fallbackTitle || 'Sheriff Sales Intelligence Temporarily Unavailable'}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {this.props.fallbackDescription ||
                'A calculation or data rendering exception occurred. The rest of the platform remains unaffected.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-2">
            {this.state.error && (
              <div className="p-3 rounded-md bg-background/80 border border-border/80 font-mono text-xs text-muted-foreground overflow-x-auto">
                <span className="font-semibold text-destructive">Error: </span>
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}
          </CardContent>
          <CardFooter className="px-5 py-3 border-t border-destructive/20 flex justify-between items-center bg-destructive/10">
            <span className="text-[11px] font-mono text-muted-foreground">
              Boundary: {this.props.componentName || 'SheriffSalesDashboard'}
            </span>
            <Button
              size="sm"
              variant="default"
              onClick={this.handleReset}
              className="h-8 text-xs font-mono font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reload Component
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}
