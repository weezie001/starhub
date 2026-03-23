import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Polyfill window.storage with localStorage
window.storage = {
  get: async (key) => {
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  set: async (key, val) => {
    localStorage.setItem(key, val);
  },
  delete: async (key) => {
    localStorage.removeItem(key);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
