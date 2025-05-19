import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'https://devlog-tbk8.onrender.com';  // FastAPI backend URL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
