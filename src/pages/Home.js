// src/pages/Home.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useLogo } from '../contexts/LogoContext'; // Import your LogoContext

const Home = () => {
  const { userData } = useUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { logoUrl } = useLogo(); // Get logoUrl from context
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  return (
    <div className="space-y-6">
      {/* כותרת וברכה */}
      <div className="text-center bg-white rounded-lg p-8 shadow-sm">
      <div className="logo-container">
      <img
          src={logoUrl || '/default-logo.png'}
          alt="Studio Logo"
          className="logo"
      />
</div>  
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {userData?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          ברוכים הבאים למערכת השיעורים של Milan Pilates
        </p>
      </div>

      {/* קופסאות מידע */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* שיעורים קרובים */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">השיעורים הקרובים שלך</h2>
          {userData?.registeredLessons?.length > 0 ? (
            <ul className="space-y-3">
              {userData.registeredLessons.map((lesson, index) => (
               new Date(lesson.date) <= today ?"":
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{lesson.time}</span>
                  <span className="text-gray-600">{lesson.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              אין שיעורים קרובים
            </p>
          )}
        </div>

        {/* סטטיסטיקות */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">סטטיסטיקות</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">שיעורים שהשתתפת</span>
              <span className="font-semibold">{userData?.completedLessons || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">שיעורים רשומים</span>
              <span className="font-semibold">{userData?.registeredLessons?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* פרטי מנוי */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">פרטי מנוי</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">סוג מנוי: </span>
              <span className="font-semibold">{userData?.membershipType || 'רגיל'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">תאריך הצטרפות: </span>
              <span className="font-semibold">{userData?.joinDate || 'לא זמין'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;