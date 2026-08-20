import React from 'react';
import ReactDOM from 'react-dom/client';
import { VariaThemeProvider } from '@varia/ui';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VariaThemeProvider>
      <App />
    </VariaThemeProvider>
  </React.StrictMode>,
);
