import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProfileScreen = ({ user, unregisterFromLesson }) => {
  const [registeredLessons, setRegisteredLessons] = useState([]);

  useEffect(() => {
    const fetchRegisteredLessons = async () => {
      if (!user?.phone) return;

      try {
        const userRef = doc(db, 'Users', user.phone);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (Array.isArray(userData.lessons)) {
            const lessonsData = await Promise.all(
              userData.lessons.map(async (lessonId) => {
                const lessonRef = doc(db, 'Lessons', lessonId);
                const lessonDoc = await getDoc(lessonRef);
                if (lessonDoc.exists()) {
                  return { id: lessonId, ...lessonDoc.data() };
                }
                return null;
              })
            );
            setRegisteredLessons(lessonsData.filter((lesson) => lesson !== null));
          }
        }
      } catch (error) {
        console.error('Error fetching registered lessons:', error);
      }
    };

    fetchRegisteredLessons();
  }, [user]);

  const isCancelable = (lesson) => {
    const lessonDate = new Date(`${lesson.date}T${lesson.hour}`);
    const now = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    return lessonDate - now > oneDayInMillis;
  };

  return (
    <div className="profile-screen p-8">
      <h1 className="text-3xl font-bold mb-6">פרופיל</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl mb-4"><strong>שם מלא:</strong> {user?.name}</p>
        <p className="text-xl mb-4"><strong>מספר טלפון:</strong> {user?.phone}</p>
        <p className="text-xl mb-4"><strong>סוג משתמש:</strong> {user?.isAdmin ? 'מנהל' : 'משתמש'}</p>
        <h2 className="text-2xl font-bold mb-4">שיעורים שנרשמתי אליהם</h2>
        <ul className="space-y-4">
          {registeredLessons.length > 0 ? (
            registeredLessons.map((lesson) => (
              <li key={lesson.id} className="border-b pb-2">
                <p><strong>תאריך:</strong> {lesson.date}</p>
                <p><strong>שעה:</strong> {lesson.hour}</p>
                <p><strong>סוג:</strong> {lesson.trainType}</p>
                <p><strong>שם המדריך:</strong> {lesson.trainerName}</p>
                <button
                  onClick={() => unregisterFromLesson(lesson.id)}
                  disabled={!isCancelable(lesson)}
                  className={`bg-red-600 text-white px-4 py-2 rounded ${
                    !isCancelable(lesson) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  בטל שיעור
                </button>
              </li>
            ))
          ) : (
            <p>לא נרשמת לשום שיעור.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProfileScreen;
