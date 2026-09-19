import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyStoredThemeEarly } from './lib/theme';

// Apply the persisted light/dark/system choice before first paint so the
// hand-drawn palette never flashes the wrong theme.
applyStoredThemeEarly();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
