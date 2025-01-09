import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useLogo } from '../contexts/LogoContext'; // Import your LogoContext


const TopNav = ({ setCurrentScreen, currentScreen, handleLogout }) => {
  const { logoUrl } = useLogo(); // Get logoUrl from context
  const { userData } = useUser();

  const menuItems = [
    { id: 'home', label: 'דף הבית', icon: '🏠' },
    { id: 'schedule', label: 'לוח שיעורים', icon: '📅' },
    { id: 'profile', label: 'פרופיל', icon: '👤' },
  ];

  if (userData?.isAdmin) {
    menuItems.push({ id: 'admin', label: 'ניהול', icon: '⚙️' });
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-25">
          <div className="flex-shrink-0 flex items-center">

            <img
              src={logoUrl } // Base64 string from Firestore
              className="w-32 h-32 object-contain"
              alt="Milan Pilates"
            />
            <span className="mr-2 text-lg font-semibold text-gray-900">
              Milan Pilates
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${currentScreen === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors mx-1`}
              >
                <span className="ml-2">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium
                       text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mx-1"
            >
              <span className="ml-2">🚪</span>
              התנתקות
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;