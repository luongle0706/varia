import React, { type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { variaTheme } from './theme';

export interface VariaThemeProviderProps {
  children: ReactNode;
}

export const VariaThemeProvider: React.FC<VariaThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={variaTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
