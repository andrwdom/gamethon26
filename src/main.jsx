// main.jsx (or index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import RegisterPage from './RegisterPage.jsx'; // Make sure the path is correct
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The Landing Page */}
        <Route path="/" element={<App />} />
        
        {/* The Registration Page */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);