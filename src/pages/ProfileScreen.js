import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';

const ProfileScreen = () => {
  const { userData } = useUser(); // Access the logged-in user's data
  const [registeredLessons, setRegisteredLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();


  useEffect(() => {
    if (userData?.phone) {
      fetchRegisteredLessons();
    }
  }, [userData]);

  const fetchRegisteredLessons = async () => {
    try {
      const userRef = doc(db, 'Users', userData.phone); // Reference to the user's document
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userLessons = userSnap.data().registeredLessons || []; // Fetch registeredLessons
        setRegisteredLessons(userLessons); // Update state with the lessons
      }
    } catch (error) {
      console.error('Error fetching registered lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
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
              new Date(lesson.date) <= today ?"":
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{lesson.title || `${lesson.type} - ${lesson.instructor}`}</h3>
                  <p className="text-gray-600">מדריך: {lesson.instructor}</p>
                  <p className="text-gray-600">תאריך: {lesson.date}</p>
                  <p className="text-gray-600">שעה: {lesson.time}</p>
                </div>
              </div>
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
