import React, { useState } from 'react';
import LoginScreen from './pages/LoginForm';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import ProfileScreen from './pages/ProfileScreen';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import LessonManagement from './pages/LessonManagement';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [registeredUsers, setRegisteredUsers] = useState([
    { phone: '1234567890', isAdmin: true, name: 'Admin User', totalLessons: 10 },
    { phone: '0987654321', isAdmin: false, name: 'Regular User', totalLessons: 5 },
  ]);
  const [lessons, setLessons] = useState([]);
  const [logo, setLogo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
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
    if (user.phone === updatedUser.phone) {
      setUser(updatedUser);
    }
  };

  const registerForLesson = (lesson) => {
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

  const NavigationBar = () => {
    return (
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
          ☰
        </button>
      </nav>
    );
  };

  const SideMenu = () => {
    return (
      <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-4">
          <button onClick={() => setMenuOpen(false)} className="text-gray-800 focus:outline-none">
            ✕
          </button>
          {logo && <img src={logo} alt="Logo" className="h-20 mx-auto my-4" />}
          <ul className="mt-4 space-y-4">
            {user?.isAdmin && (
              <>
                <li>
                  <button onClick={() => { setCurrentScreen('home'); setMenuOpen(false); }} className="hover:text-gray-400">דף הבית</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('admin'); setMenuOpen(false); }} className="hover:text-gray-400">לוח ניהול</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('schedule'); setMenuOpen(false); }} className="hover:text-gray-400">לוח זמנים</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('profile'); setMenuOpen(false); }} className="hover:text-gray-400">פרופיל</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('userManagement'); setMenuOpen(false); }} className="hover:text-gray-400">ניהול משתמשים</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('lessonManagement'); setMenuOpen(false); }} className="hover:text-gray-400">ניהול שיעורים</button>
                </li>
              </>
            )}
            {!user?.isAdmin && (
              <>
                <li>
                  <button onClick={() => { setCurrentScreen('home'); setMenuOpen(false); }} className="hover:text-gray-400">דף הבית</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('schedule'); setMenuOpen(false); }} className="hover:text-gray-400">לוח זמנים</button>
                </li>
                <li>
                  <button onClick={() => { setCurrentScreen('profile'); setMenuOpen(false); }} className="hover:text-gray-400">פרופיל</button>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout} className="hover:text-gray-400">התנתק</button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Main App Layout
  return (
    <div className="relative min-h-screen bg-gray-100" dir="rtl">
      {user && <NavigationBar />}
      {user && <SideMenu />}
      <div className="container mx-auto p-4">
        {currentScreen === 'login' && (
          <LoginScreen
            registeredUsers={registeredUsers}
            setUser={setUser}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentScreen === 'home' && (
          <Home
            user={user}
            lessons={lessons}
            logo={logo}
          />
        )}
        {currentScreen === 'schedule' && (
          <Schedule
            lessons={lessons}
            user={user}
            registerForLesson={registerForLesson}
            unregisterFromLesson={unregisterFromLesson}
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            updateUser={updateUser}
            unregisterFromLesson={unregisterFromLesson}
          />
        )}
        {currentScreen === 'admin' && user?.isAdmin && (
          <AdminDashboard setCurrentScreen={setCurrentScreen} setLogo={setLogo} />
        )}
        {currentScreen === 'userManagement' && user?.isAdmin && (
          <UserManagement
            registeredUsers={registeredUsers}
            addUser={addUser}
            deleteUser={deleteUser}
          />
        )}
        {currentScreen === 'lessonManagement' && user?.isAdmin && (
          <LessonManagement addLesson={addLesson} />
        )}
      </div>
    </div>
  );
};

export default App;