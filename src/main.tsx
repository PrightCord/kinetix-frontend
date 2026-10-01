import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './demo/bootstrap';
import { Workbench } from './lab/Workbench';
import './index.css';
import { applyStoredThemeEarly } from './lib/theme';

// Apply the persisted light/dark/system choice before first paint.
applyStoredThemeEarly();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Workbench />
  </StrictMode>,
);
