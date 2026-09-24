import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UploadApp } from './UploadApp';
import '../styles.css';
import '../siteD.css';

// The site-D look of /host (square buttons, heavy Fraunces), scoped to these pages.
document.body.classList.add('site-d');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UploadApp />
  </StrictMode>,
);
