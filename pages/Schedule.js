import React, { useState, useEffect } from 'react';
import { useUser } from '../src/contexts/UserContext';
import { fetchLessons, updateLessonRegistration } from '../src/services/firebaseService';
import LessonCard from '../src/components/LessonCard';
import ErrorMessage from '../src/components/ErrorMessage';

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { userData } = useUser();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const lessonsData = await fetchLessons();
      const now = new Date();

      const updatedLessons = lessonsData.map((lesson) => ({
        ...lesson,
        isActive: new Date(`${lesson.date} ${lesson.time}`) >= now,
      }));

      setClasses(updatedLessons.filter((lesson) => lesson.isActive));
    } catch (error) {
      setError('אירעה שגיאה בטעינת לוח השיעורים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (lesson) => {
    try {
      await updateLessonRegistration(lesson.id, userData, true);
      fetchClasses();
    } catch (error) {
      setError('אירעה שגיאה בהרשמה לשיעור');
    }
  };

  const handleCancelRegistration = async (lesson) => {
    try {
      await updateLessonRegistration(lesson.id, userData, false);
      fetchClasses();
    } catch (error) {
      setError('אירעה שגיאה בביטול ההרשמה לשיעור');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">לוח שיעורים</h1>
      {error && <ErrorMessage message={error} />}
      {isLoading ? (
        <div className="text-center text-gray-500">טוען...</div>
      ) : (
        classes.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isRegistered={lesson.waitingList.includes(userData.phone)}
            onRegister={handleRegister}
            onCancel={handleCancelRegistration}
          />
        ))
      )}
    </div>
  );
};

export default Schedule;
