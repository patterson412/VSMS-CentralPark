'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Container,
  Stack,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  BugReport,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
          <Paper sx={{ p: { xs: 4, sm: 6, md: 8 }, textAlign: 'center' }}>
            <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center">
              <ErrorOutline sx={{
                color: 'error.main',
                fontSize: { xs: '4rem', sm: '6rem', md: '8rem' }
              }} />

              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  Something went wrong
                </Typography>
                <Typography variant="body1" sx={{
                  color: 'text.secondary',
                  mb: { xs: 3, sm: 4 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 1, sm: 0 }
                }}>
                  We're sorry, but an unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
                </Typography>
              </Box>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                  <AlertTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BugReport sx={{ mr: 2 }} />
                      Development Error Details
                    </Box>
                  </AlertTitle>
                  <Typography variant="body2" sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    mb: 2
                  }}>
                    <strong>Error:</strong> {this.state.error.message}
                  </Typography>
                  {this.state.error.stack && (
                    <Typography variant="body2" sx={{
                      fontFamily: 'monospace',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      whiteSpace: 'pre-wrap'
                    }}>
                      <strong>Stack Trace:</strong>
                      {'\n'}{this.state.error.stack}
                    </Typography>
                  )}
                </Alert>
              )}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  size="large"
                  sx={{
                    px: { xs: 4, sm: 3 },
                    py: { xs: 1.5, sm: 1 },
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  size="large"
                  sx={{
                    px: { xs: 4, sm: 3 },
                    py: { xs: 1.5, sm: 1 },
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Go Home
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // In a real app, you might want to send this to an error reporting service
  };
}

// Global error boundary wrapper
interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // In production, you might want to send to error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

// Specific error boundary for async operations
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AsyncErrorBoundary({ children, fallback }: AsyncErrorBoundaryProps) {
  const customFallback = fallback || (
    <Alert severity="error" sx={{ m: 4 }}>
      <AlertTitle>Error Loading Content</AlertTitle>
      There was an error loading this content. Please try refreshing the page.
    </Alert>
  );

  return (
    <ErrorBoundary fallback={customFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Form-specific error boundary
interface FormErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export function FormErrorBoundary({ children, onError }: FormErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Form error:', error, errorInfo);
    onError?.(error);
  };

  const fallback = (
    <Alert severity="error" sx={{ m: 4 }}>
      <AlertTitle>Form Error</AlertTitle>
      There was an error with the form. Please refresh the page and try again.
    </Alert>
  );

  return (
    <ErrorBoundary onError={handleError} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}