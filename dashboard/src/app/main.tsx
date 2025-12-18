import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import App from './App';
import { Providers } from './providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);

