import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { getUserLessons } from '../services/firebaseService';
import LessonItem from '../components/LessonItem';
import ErrorMessage from '../components/ErrorMessage';

const ProfileScreen = () => {
  const { userData } = useUser();
  const [registeredLessons, setRegisteredLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date();

  // פונקציה לשליפת שיעורים
  const fetchRegisteredLessons = useCallback(async () => {
    try {
      const lessons = await getUserLessons(userData.phone);
      const futureLessons = lessons.filter((lesson) => new Date(lesson.date) > today);
      setRegisteredLessons(futureLessons);
    } catch (error) {
      console.error('Error fetching registered lessons:', error);
      setError('אירעה שגיאה בטעינת השיעורים');
    } finally {
      setIsLoading(false);
    }
  }, [userData, today]);

  // שליפת שיעורים על בסיס נתוני המשתמש
  useEffect(() => {
    if (userData?.phone) {
      fetchRegisteredLessons();
    }
  }, [fetchRegisteredLessons]);

  // אם אין נתוני משתמש
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {error && <ErrorMessage message={error} />}

      {/* User Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">פרופיל משתמש</h1>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 ml-2">👤</span>
            <span className="text-gray-600">שם: </span>
            <span className="font-medium mr-2">{userData.name}</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 ml-2">📱</span>
            <span className="text-gray-600">טלפון: </span>
            <span className="font-medium mr-2" dir="ltr">{userData.phone}</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 ml-2">🛡️</span>
            <span className="text-gray-600">סוג משתמש: </span>
            <span className="font-medium mr-2">{userData.isAdmin ? 'מנהל' : 'משתמש רגיל'}</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 ml-2">🛡️</span>
            <span className="text-gray-600">סוג מנוי: </span>
            <span className="font-medium mr-2">{userData.membership || 'לא מוגדר'}</span>
          </div>
        </div>
      </div>

      {/* Registered Lessons */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">השיעורים שנרשמת אליהם</h2>
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">טוען שיעורים...</p>
        ) : registeredLessons.length > 0 ? (
          <div className="space-y-4">
            {registeredLessons.map((lesson, index) => (
              <LessonItem key={index} lesson={lesson} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            לא נרשמת לשום שיעור
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
