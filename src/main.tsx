import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary title="Application encountered an error" description="Please retry or return to the homepage. Your data remains safe.">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
