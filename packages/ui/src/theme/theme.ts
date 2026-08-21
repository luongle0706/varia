import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { colorTokens } from './tokens';

export const variaThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: colorTokens.bg.base,
      paper: colorTokens.bg.surface,
    },
    primary: {
      main: colorTokens.accent.violet,
      light: colorTokens.accent.violetLight,
    },
    secondary: {
      main: colorTokens.accent.cyan,
      light: colorTokens.accent.cyanLight,
    },
    success: {
      main: colorTokens.accent.emerald,
    },
    warning: {
      main: colorTokens.accent.amber,
    },
    error: {
      main: colorTokens.accent.rose,
    },
    text: {
      primary: colorTokens.text.primary,
      secondary: colorTokens.text.secondary,
    },
    divider: colorTokens.bg.border,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarGutter: 'stable',
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: colorTokens.bg.base,
          color: colorTokens.text.primary,
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.6)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colorTokens.bg.surface,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${colorTokens.bg.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
};

export const variaTheme = createTheme(variaThemeOptions);
