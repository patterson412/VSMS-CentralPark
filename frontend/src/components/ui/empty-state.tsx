import { Box, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, sm: 10, md: 12 },
        px: { xs: 2, sm: 0 },
        textAlign: 'center'
      }}
    >
      {icon && (
        <Box sx={{ mb: { xs: 2, sm: 3 }, color: 'text.disabled' }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{
        mb: 1,
        color: 'text.primary',
        fontWeight: 600,
        fontSize: { xs: '1.1rem', sm: '1.25rem' }
      }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{
        mb: { xs: 3, sm: 4 },
        color: 'text.secondary',
        maxWidth: 400,
        fontSize: { xs: '0.875rem', sm: '1rem' }
      }}>
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}