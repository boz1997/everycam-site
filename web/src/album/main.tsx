import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AlbumApp } from './AlbumApp';
import '../styles.css';
import '../siteD.css';

// The site-D look of /host (square buttons, heavy Fraunces), scoped to these pages.
document.body.classList.add('site-d');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlbumApp />
  </StrictMode>,
);
