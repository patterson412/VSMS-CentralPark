'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // No session, redirect to login
      router.push('/admin/login');
      return;
    }

    if (requiredRole === 'admin' && session.user?.role !== 'admin') {
      // User doesn't have admin role
      router.push('/admin/login');
      return;
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Checking authentication..." />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="Authentication Required"
          description="Please log in to access this page."
          action={{
            label: 'Go to Login',
            onClick: () => router.push('/admin/login'),
          }}
        />
      </Box>
    );
  }

  if (requiredRole === 'admin' && session.user?.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="Access Denied"
          description="You don't have permission to access this page."
          action={{
            label: 'Go to Login',
            onClick: () => router.push('/admin/login'),
          }}
        />
      </Box>
    );
  }

  return <>{children}</>;
}