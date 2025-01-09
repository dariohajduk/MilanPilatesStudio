import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { LogoProvider } from './contexts/LogoContext';
import { LessonsProvider } from './contexts/LessonsContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <LogoProvider>
        <LessonsProvider>
          <App />
        </LessonsProvider>
      </LogoProvider>
    </UserProvider>
  </React.StrictMode>
);


