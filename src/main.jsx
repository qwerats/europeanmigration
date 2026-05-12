import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

function routerBasename() {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') return '/';
  return base.replace(/\/$/, '');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
