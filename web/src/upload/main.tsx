import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UploadApp } from './UploadApp';
import '../styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UploadApp />
  </StrictMode>,
);
