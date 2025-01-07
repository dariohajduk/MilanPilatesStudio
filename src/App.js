import React, { useState } from 'react';
import LoginScreen from './pages/LoginForm';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import ProfileScreen from './pages/ProfileScreen';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import LessonManagement from './pages/LessonManagement';
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [registeredUsers, setRegisteredUsers] = useState([
    { phone: '1234567890', isAdmin: true, name: 'Admin User', registeredLessons: [] },
    { phone: '0987654321', isAdmin: false, name: 'Regular User', registeredLessons: [] },
  ]);
  const [lessons, setLessons] = useState([]);
  const [logo, setLogo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  const handleLogin = (user) => {
    setUser(user);
    setCurrentScreen('home');
  };

  const addUser = (newUser) => {
    setRegisteredUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const deleteUser = (phone) => {
    setRegisteredUsers((prevUsers) => prevUsers.filter((user) => user.phone !== phone));
  };

  const addLesson = (newLesson) => {
    setLessons((prevLessons) => [...prevLessons, newLesson]);
  };

  const updateUser = (updatedUser) => {
    setRegisteredUsers((prevUsers) =>
      prevUsers.map((user) => (user.phone === updatedUser.phone ? updatedUser : user))
    );
    if (user?.phone === updatedUser.phone) {
      setUser(updatedUser);
    }
  };

  const registerForLesson = (lesson) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      registeredLessons: [...(user.registeredLessons || []), lesson],
    };

    updateUser(updatedUser);
  };

  const unregisterFromLesson = (lesson) => {
    const updatedUser = {
      ...user,
      registeredLessons: user.registeredLessons.filter(
        (l) => l.date !== lesson.date || l.hour !== lesson.hour
      ),
    };

    updateUser(updatedUser);
  };

  return (
    <div className="relative min-h-screen bg-gray-100" dir="rtl">
      {user && (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">האפליקציה שלי</h1>
        </nav>
      )}
      {menuOpen && (
        <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50`}>
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-gray-800 text-xl focus:outline-none"
            >
              ✕
            </button>
            <ul className="mt-4 space-y-4">
              <li>
                <button
                  onClick={() => {
                    setCurrentScreen('home');
                    setMenuOpen(false);
                  }}
                  className="text-gray-800 hover:text-gray-500"
                >
                  דף הבית
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentScreen('schedule');
                    setMenuOpen(false);
                  }}
                  className="text-gray-800 hover:text-gray-500"
                >
                  לוח זמנים
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentScreen('profile');
                    setMenuOpen(false);
                  }}
                  className="text-gray-800 hover:text-gray-500"
                >
                  פרופיל
                </button>
              </li>
              {user?.isAdmin && (
                <>
                  <li>
                    <button
                      onClick={() => {
                        setCurrentScreen('admin');
                        setMenuOpen(false);
                      }}
                      className="text-gray-800 hover:text-gray-500"
                    >
                      לוח ניהול
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCurrentScreen('userManagement');
                        setMenuOpen(false);
                      }}
                      className="text-gray-800 hover:text-gray-500"
                    >
                      ניהול משתמשים
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCurrentScreen('lessonManagement');
                        setMenuOpen(false);
                      }}
                      className="text-gray-800 hover:text-gray-500"
                    >
                      ניהול שיעורים
                    </button>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="text-gray-800 hover:text-gray-500"
                >
                  התנתק
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="container mx-auto p-4">
        {currentScreen === 'login' && (
          <LoginScreen
            registeredUsers={registeredUsers}
            setUser={handleLogin}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === 'home' && <Home user={user} lessons={lessons} logo={logo} />}
        {currentScreen === 'schedule' && (
          <Schedule
            userId={user?.phone}
            lessons={lessons}
            registerForLesson={registerForLesson}
            unregisterFromLesson={unregisterFromLesson}
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen 
           user={user}
           unregisterFromLesson={unregisterFromLesson}
         />
        )}
        {currentScreen === 'admin' && <AdminDashboard setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'userManagement' && (
          <UserManagement
            registeredUsers={registeredUsers}
            addUser={addUser}
            deleteUser={deleteUser}
          />
        )}
        {currentScreen === 'lessonManagement' && (
          <LessonManagement lessons={lessons} addLesson={addLesson} />
        )}
      </div>
    </div>
  );
};

export default App;
