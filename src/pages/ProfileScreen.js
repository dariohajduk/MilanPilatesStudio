import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const ProfileScreen = ({ user, unregisterFromLesson }) => {
  const isCancelable = (lesson) => {
    const lessonDate = new Date(`${lesson.date}T${lesson.hour}`);
    const now = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    return lessonDate - now > oneDayInMillis;
  };

  const getMonthlyLessonCount = () => {
    const lessonCount = {};
    user?.registeredLessons?.forEach((lesson) => {
      const lessonDate = new Date(`${lesson.date}T${lesson.hour}`);
      const month = lessonDate.getMonth() + 1; // Months are zero-based
      const year = lessonDate.getFullYear();
      const key = `${year}-${month}`;
      if (!lessonCount[key]) {
        lessonCount[key] = 0;
      }
      lessonCount[key]++;
    });
    return lessonCount;
  };

  const lessonCount = getMonthlyLessonCount();
  const chartData = {
    labels: Object.keys(lessonCount),
    datasets: [
      {
        label: 'כמות אימונים לחודש',
        data: Object.values(lessonCount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="profile-screen p-8">
      <h1 className="text-3xl font-bold mb-6">פרופיל</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl mb-4"><strong>שם מלא:</strong> {user?.name}</p>
        <p className="text-xl mb-4"><strong>מספר טלפון:</strong> {user?.phone}</p>
        <p className="text-xl mb-4"><strong>סוג משתמש:</strong> {user?.isAdmin ? 'מנהל' : 'משתמש'}</p>
        <p className="text-xl mb-4"><strong>כמות האימונים שהוזמנו ולא בוטלו:</strong> {user?.registeredLessons?.length}</p>
        <h2 className="text-2xl font-bold mb-4">שיעורים שנרשמתי אליהם</h2>
        <ul className="space-y-4">
          {user?.registeredLessons?.length > 0 ? (
            user.registeredLessons.map((lesson, index) => (
              <li key={index} className="border-b pb-2">
                <p><strong>תאריך:</strong> {lesson.date}</p>
                <p><strong>שעה:</strong> {lesson.hour}</p>
                <p><strong>סוג:</strong> {lesson.type}</p>
                <p><strong>שם המדריך:</strong> {lesson.trainerName}</p>
                <button
                  onClick={() => unregisterFromLesson(lesson)}
                  className={`w-full bg-red-600 text-white rounded p-2 hover:bg-red-700 ${!isCancelable(lesson) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isCancelable(lesson)}
                >
                  בטל שיעור
                </button>
              </li>
            ))
          ) : (
            <p>לא נרשמת לשום שיעור.</p>
          )}
        </ul>
        <h2 className="text-2xl font-bold mb-4 mt-8">כמות אימונים לחודש</h2>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default ProfileScreen;