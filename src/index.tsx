import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';

const rootElement = document.getElementById('root') as HTMLElement;
const reactRoot = createRoot(rootElement);
reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
);
