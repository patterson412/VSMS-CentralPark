'use client';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff', // matches theme.palette.background.paper
                color: '#1e293b', // matches theme.palette.text.primary
                border: '1px solid #e2e8f0', // light gray border
                borderRadius: '8px', // matches theme.shape.borderRadius
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#14b8a6', // matches theme.palette.primary.main
                  secondary: '#ffffff', // matches theme.palette.secondary.main
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444', // standard error red
                  secondary: '#ffffff', // matches theme.palette.secondary.main
                },
              },
            }}
          />
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  );
}