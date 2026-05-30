import { ErrorInfo } from 'react';

export interface ErrorBoundaryContentProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
}