import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useLogo } from '../contexts/LogoContext';

const TopNav = ({ setCurrentScreen, currentScreen, handleLogout }) => {
  const { logoUrl } = useLogo();
  const { userData } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // סגירת התפריט בלחיצה מחוץ לתפריט
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'home', label: 'דף הבית', icon: '🏠' },
    { id: 'schedule', label: 'לוח שיעורים', icon: '📅' },
    { id: 'profile', label: 'פרופיל', icon: '👤' },
  ];

  if (userData?.isAdmin) {
    menuItems.push({ id: 'admin', label: 'ניהול', icon: '⚙️' });
  }

  const handleMenuItemClick = (itemId) => {
    setCurrentScreen(itemId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-25">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src={logoUrl}
              className="w-32 h-32 object-contain"
              alt="Milan Pilates"
            />
            <span className="mr-2 text-lg font-semibold text-gray-900">
              Milan Pilates
            </span>
          </div>

          {/* Menu Section */}
          <div className="relative" ref={menuRef}>
            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 focus:outline-none"
            >
              <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
              <span className="mr-2 text-sm font-medium">תפריט</span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full text-right flex items-center px-4 py-2 text-sm
                        ${currentScreen === item.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span className="ml-2">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-right flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <span className="ml-2">🚪</span>
                    התנתקות
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;