// src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import Tasks from './components/Tasks.js';

import './App.css';

// Render the main App component into the root element in the HTML
ReactDOM.createRoot(document.getElementById('root')).render(
    <Tasks />
);
