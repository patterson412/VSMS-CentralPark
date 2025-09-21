import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 40,
  message = 'Loading...',
  fullScreen = false
}: LoadingSpinnerProps) {
  const content = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: { xs: 1.5, sm: 2 }
    }}>
      <CircularProgress
        size={size}
        sx={{
          width: { xs: Math.min(size, 32), sm: size },
          height: { xs: Math.min(size, 32), sm: size }
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: 'center',
            px: { xs: 2, sm: 0 }
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: (theme) => `${theme.palette.background.paper}cc`, // 80% opacity
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 3, sm: 4 },
      px: { xs: 2, sm: 0 }
    }}>
      {content}
    </Box>
  );
}