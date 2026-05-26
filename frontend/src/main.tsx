import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply saved theme on load
const saved = localStorage.getItem('genkeep-ui');
if (saved) {
  try {
    const { state } = JSON.parse(saved);
    if (state?.theme === 'dark') document.documentElement.classList.add('dark');
  } catch { /**/ }
} else {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
