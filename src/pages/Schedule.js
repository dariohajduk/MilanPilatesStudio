import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Schedule = ({ userId }) => {
  const [lessons, setLessons] = useState([]);
  const [userLessons, setUserLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Fetch all lessons from Firebase
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Lessons'));
        const lessonsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLessons(lessonsList);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };

    fetchLessons();
  }, []);

  // Fetch lessons registered by the user
  useEffect(() => {
    const fetchUserLessons = async () => {
      if (!userId) {
        setUserLessons([]);
        return;
      }

      try {
        const userRef = doc(db, 'Users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, { lessons: [] });
          setUserLessons([]);
          return;
        }

        const userData = userDoc.data();
        setUserLessons(userData.lessons || []);
      } catch (error) {
        console.error('Error fetching user lessons:', error);
        setUserLessons([]);
      }
    };

    fetchUserLessons();
  }, [userId]);

  const registerForLesson = async (lessonId) => {
    if (!userId) {
      setAuthError('אנא התחבר כדי להירשם לשיעורים');
      return;
    }

    setIsLoading(true);
    try {
      const lessonRef = doc(db, 'Lessons', lessonId);
      const userRef = doc(db, 'Users', userId);

      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson || parseInt(lesson.numberOfPersons || '0') <= 0) {
        throw new Error('אין מקומות פנויים');
      }

      // Update the number of persons in the lesson
      await updateDoc(lessonRef, {
        numberOfPersons: (parseInt(lesson.numberOfPersons) - 1).toString(),
      });

      // Add lesson to user document
      await updateDoc(userRef, {
        lessons: arrayUnion(lessonId),
      });

      // Update local state
      setLessons(prev => prev.map(l => 
        l.id === lessonId ? { ...l, numberOfPersons: (parseInt(l.numberOfPersons) - 1).toString() } : l
      ));
      setUserLessons(prev => [...prev, lessonId]);
    } catch (error) {
      console.error('Error registering for lesson:', error);
      setAuthError('שגיאה ברישום לשיעור');
    } finally {
      setIsLoading(false);
    }
  };

  const unregisterFromLesson = async (lessonId) => {
    if (!userId) {
      setAuthError('אנא התחבר כדי לבטל רישום לשיעורים');
      return;
    }

    setIsLoading(true);
    try {
      const lessonRef = doc(db, 'Lessons', lessonId);
      const userRef = doc(db, 'Users', userId);

      // Update the number of persons in the lesson
      await updateDoc(lessonRef, {
        numberOfPersons: (parseInt(lessons.find(l => l.id === lessonId).numberOfPersons) + 1).toString(),
      });

      // Remove lesson from user document
      await updateDoc(userRef, {
        lessons: arrayRemove(lessonId),
      });

      // Update local state
      setLessons(prev => prev.map(l => 
        l.id === lessonId ? { ...l, numberOfPersons: (parseInt(l.numberOfPersons) + 1).toString() } : l
      ));
      setUserLessons(prev => prev.filter(id => id !== lessonId));
    } catch (error) {
      console.error('Error unregistering from lesson:', error);
      setAuthError('שגיאה בביטול רישום לשיעור');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">לוח זמנים</h1>
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {authError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.length === 0 ? (
          <div>אין שיעורים זמינים כרגע.</div>
        ) : (
          lessons.map(lesson => (
            <div key={lesson.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-bold">{lesson.trainType}</h2>
              <p>{lesson.date} - {lesson.hour}</p>
              <p>מדריך: {lesson.trainerName}</p>
              <p>מקומות פנויים: {lesson.numberOfPersons}</p>
              {userLessons.includes(lesson.id) ? (
                <button
                  onClick={() => unregisterFromLesson(lesson.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                >
                  ביטול רישום
                </button>
              ) : (
                <button
                  onClick={() => registerForLesson(lesson.id)}
                  disabled={isLoading}
                  className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  הירשם
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;
