'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [status, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Don't render login form if already authenticated
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return null;
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: (theme) => `linear-gradient(135deg, ${theme.palette.primary[50]} 0%, ${theme.palette.primary[200]} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, sm: 3 }
    }}>
      <Container maxWidth="xs">
          <Paper elevation={8} sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            maxWidth: 400,
            mx: 'auto'
          }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <AdminPanelSettings sx={{
                  color: 'primary.main',
                  fontSize: { xs: 48, sm: 56 }
                }} />
              </Box>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}>
                Admin Login
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Vehicle Sales Management System
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 }
            }}>
              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />

              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  mt: { xs: 1, sm: 2 },
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 3
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Default Credentials Info */}
            <Box sx={{
              mt: { xs: 3, sm: 4 },
              p: { xs: 2.5, sm: 3 },
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: 1,
              borderColor: 'grey.200'
            }}>
              <Typography variant="body2" sx={{
                color: 'text.secondary',
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                <strong>Default Credentials:</strong><br />
                Username: admin<br />
                Password: admin
              </Typography>
            </Box>

            {/* Back to Home */}
            <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => router.push('/')}
                disabled={isLoading}
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.50'
                  }
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Paper>
      </Container>
    </Box>
  );
}