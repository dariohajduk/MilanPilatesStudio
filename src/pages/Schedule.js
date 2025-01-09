import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase';
import { getDocs, collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/he';

moment.locale('he');

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userData, updateUserData } = useUser();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Lessons'));
      const lessonsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateTime: moment(`${data.date} ${data.time}`, 'YYYY-MM-DD HH:mm').toDate(),
        };
      });
      setClasses(lessonsData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (lesson) => {
    if (!userData || !userData.phone) {
      alert('עליך להתחבר כדי להירשם לשיעור');
      return;
    }

    try {
      const lessonRef = doc(db, 'Lessons', lesson.id);

      // Update the waiting list in the lesson
      await updateDoc(lessonRef, {
        waitingList: arrayUnion(userData.phone),
        registeredParticipants: lesson.registeredParticipants + 1, // Increment registered count
      });

      // Update the user's profile in Firebase
      const userRef = doc(db, 'Users', userData.phone);
      await updateDoc(userRef, {
        registeredLessons: arrayUnion({
          id: lesson.id,
          date: lesson.date,
          time: lesson.time,
          type: lesson.type,
          instructor: lesson.instructor,
        }),
      });

      // Update local state for dynamic UI changes
      setClasses((prev) =>
        prev.map((l) =>
          l.id === lesson.id
            ? {
                ...l,
                waitingList: [...l.waitingList, userData.phone],
                registeredParticipants: l.registeredParticipants + 1,
              }
            : l
        )
      );

      updateUserData({
        ...userData,
        registeredLessons: [
          ...(userData.lessons || []),
          {
            id: lesson.id,
            date: lesson.date,
            time: lesson.time,
            type: lesson.type,
            instructor: lesson.instructor,
          },
        ],
      });

      console.log('נרשמת בהצלחה לשיעור!');
    } catch (error) {
      console.error('Error registering for lesson:', error);
      alert('אירעה שגיאה בהרשמה לשיעור');
    }
  };

  const handleCancelRegistration = async (lesson) => {
    if (!userData || !userData.phone) {
      alert('עליך להתחבר כדי לבטל הרשמה לשיעור');
      return;
    }

    try {
      const lessonRef = doc(db, 'Lessons', lesson.id);

      // Update the waiting list in the lesson
      await updateDoc(lessonRef, {
        waitingList: arrayRemove(userData.phone),
        registeredParticipants: lesson.registeredParticipants - 1, // Decrement registered count
      });

      // Update the user's profile in Firebase
      const userRef = doc(db, 'Users', userData.phone);
      await updateDoc(userRef, {
        registeredLessons: arrayRemove({
          id: lesson.id,
          date: lesson.date,
          time: lesson.time,
          type: lesson.type,
          instructor: lesson.instructor,
        }),
      });

      // Update local state for dynamic UI changes
      setClasses((prev) =>
        prev.map((l) =>
          l.id === lesson.id
            ? {
                ...l,
                waitingList: l.waitingList.filter((phone) => phone !== userData.phone),
                registeredParticipants: l.registeredParticipants - 1,
              }
            : l
        )
      );

      updateUserData({
        ...userData,
        lessons: (userData.lessons || []).filter(
          (lessonItem) => lessonItem.id !== lesson.id
        ),
      });

      console.log('הרשמתך לשיעור בוטלה בהצלחה!');
    } catch (error) {
      console.error('Error canceling registration:', error);
      alert('אירעה שגיאה בביטול ההרשמה לשיעור');
    }
  };

  // Group lessons by date
  const lessonsByDate = classes.reduce((acc, lesson) => {
    const date = lesson.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lesson);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">לוח שיעורים</h1>
      {isLoading ? (
        <div className="text-center text-gray-500">טוען...</div>
      ) : (
        <div>
          {Object.keys(lessonsByDate).map((date) => (
            <div key={date} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{moment(date).format('DD/MM/YYYY')}</h2>
              <div className="grid grid-cols-1 gap-4">
                {lessonsByDate[date].map((lesson) => {
                  const isRegistered = lesson.waitingList.includes(userData?.phone);

                  return (
                    <div
                      key={lesson.id}
                      className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col"
                    >
                      <div className="text-lg font-semibold text-gray-800">
                        {lesson.type} עם {lesson.instructor}
                      </div>
                      <div className="text-gray-600 mt-1">שעה: {lesson.time}</div>
                      <div className="text-gray-600 mt-1">
                        משתתפים מקסימליים: {lesson.maxParticipants}
                      </div>
                      <div className="text-gray-600 mt-1">
                        משתתפים רשומים: {lesson.registeredParticipants}
                      </div>
                      <div className="text-gray-600 mt-1">
                        מקומות פנויים: {lesson.maxParticipants - lesson.registeredParticipants}
                      </div>
                      {isRegistered ? (
                        <button
                          onClick={() => handleCancelRegistration(lesson)}
                          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          בטל הרשמה
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(lesson)}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          הירשם לשיעור
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
