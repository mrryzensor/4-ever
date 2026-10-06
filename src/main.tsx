import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The application root element is missing.');

// Mark the active client build for diagnostics and force browsers with a stale
// rejected module response to fetch this refreshed bundle after deployment.
rootElement.dataset.clientBuild = '20261006-cache-refresh';

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
