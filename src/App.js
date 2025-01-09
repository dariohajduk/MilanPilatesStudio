import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import LoginForm from './pages/LoginForm';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import ProfileScreen from './pages/ProfileScreen';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import LessonManagement from './pages/LessonManagement';
import TopNav from './components/TopNav';
import './index.css';

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const { isLoggedIn, userData, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const addUser = (user) => {
    setRegisteredUsers([...registeredUsers, user]);
  };

  const deleteUser = (phone) => {
    setRegisteredUsers(registeredUsers.filter(user => user.phone !== phone));
  };

  const screenComponents = {
    home: <Home user={userData} lessons={userData?.registeredLessons || []} />,
    schedule: <Schedule />,
    profile: <ProfileScreen />,
    admin: userData?.isAdmin ? <AdminDashboard setCurrentScreen={setCurrentScreen} /> : null,
    lessons: userData?.isAdmin ? <LessonManagement /> : null,
    users: userData?.isAdmin ? <UserManagement registeredUsers={registeredUsers} addUser={addUser} deleteUser={deleteUser} /> : null,
    settings: userData?.isAdmin ? <AdminDashboard setCurrentScreen={setCurrentScreen} activeTab="settings" /> : null,
  };

  useEffect(() => {
    console.log('המסך הנוכחי:', currentScreen);
    console.log('isLoggedIn:', isLoggedIn);
    console.log('userData:', userData);
  }, [currentScreen, isLoggedIn, userData]);

  return (
    <div className="relative min-h-screen bg-gray-100" dir="rtl">
      {isLoggedIn && (
        <TopNav
          setCurrentScreen={setCurrentScreen}
          currentScreen={currentScreen}
          handleLogout={logout}
          userData={userData}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      )}

      {menuOpen && isLoggedIn && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden">
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-800 text-xl"
            >
              ✕
            </button>
            <div className="mt-12 space-y-4">
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  setMenuOpen(false);
                }}
                className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                דף הבית
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('schedule');
                  setMenuOpen(false);
                }}
                className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                לוח שיעורים
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('profile');
                  setMenuOpen(false);
                }}
                className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              >
                פרופיל
              </button>
              {userData?.isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setCurrentScreen('admin');
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  >
                    ניהול
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScreen('users');
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  >
                    ניהול משתמשים
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScreen('lessons');
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  >
                    ניהול שיעורים
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScreen('settings');
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  >
                    הגדרות
                  </button>
                </>
              )}
              <button
                onClick={logout}
                className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4">
        {!isLoggedIn ? (
          <LoginForm setCurrentScreen={setCurrentScreen} />
        ) : (
          screenComponents[currentScreen] || <Home />
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;