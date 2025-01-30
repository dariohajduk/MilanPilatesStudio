import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { LessonsProvider } from './contexts/LessonsContext';
import './index.css';

import { LogoProvider } from "./contexts/LogoContext"; // Import context providers before using them


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LogoProvider>
    <App />
  </LogoProvider>
);

