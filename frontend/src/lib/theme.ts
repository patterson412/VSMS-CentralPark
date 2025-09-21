'use client';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColor {
    50?: string;
    200?: string;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      50: '#f0fdfa',    // Very light teal for hover effects
      200: '#99f6e4',   // Light teal for borders
      light: '#5eead4',
      main: '#14b8a6',  // Primary teal
      dark: '#0f766e',  // Accent dark teal
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',  // Secondary white
      dark: '#f8fafc',
      contrastText: '#1e293b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',   // Dark gray/black for readability
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;