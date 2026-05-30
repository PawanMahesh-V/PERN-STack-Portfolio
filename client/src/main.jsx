import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/icons.js'; // Register FA icon library globally
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
