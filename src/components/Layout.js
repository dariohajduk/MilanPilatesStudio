
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <nav className="flex justify-between">
          <div>
            <Link to="/" className="mr-4">Home</Link>
            <Link to="/schedule" className="mr-4">Schedule</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2025 Milan Pilates Studio
      </footer>
    </div>
  );
};

export default Layout;
    