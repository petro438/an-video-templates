import React from 'react';
import ReactDOM from 'react-dom/client';
import './tokens.css';
import App from './App.jsx';

// Default theme; user toggle persists to localStorage
const savedTheme = localStorage.getItem('an-builder-theme') ?? 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
