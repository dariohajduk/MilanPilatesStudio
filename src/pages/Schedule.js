import React from 'react';

const Schedule = ({ lessons, user, registerForLesson, unregisterFromLesson }) => {
  const isRegistered = (lesson) => {
    return user?.registeredLessons?.some((l) => l.date === lesson.date && l.hour === lesson.hour);
  };

  const isCancelable = (lesson) => {
    const lessonDate = new Date(`${lesson.date}T${lesson.hour}`);
    const now = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    return lessonDate - now > oneDayInMillis;
  };

  return (
    <div className="schedule p-8">
      <h1 className="text-3xl font-bold mb-6 text-teal-700">לוח זמנים</h1>
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <p className="text-teal-600">אין שיעורים זמינים.</p>
        ) : (
          lessons.map((lesson, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-teal-200">
              <p className="text-teal-800"><strong>תאריך:</strong> {lesson.date}</p>
              <p className="text-teal-800"><strong>שעה:</strong> {lesson.hour}</p>
              <p className="text-teal-800"><strong>סוג:</strong> {lesson.type}</p>
              <p className="text-teal-800"><strong>שם המדריך:</strong> {lesson.trainerName}</p>
              <p className="text-teal-800"><strong>כמות מקסימלית של משתתפים:</strong> {lesson.maxParticipants}</p>
              {isRegistered(lesson) ? (
                <button
                  onClick={() => unregisterFromLesson(lesson)}
                  className={`w-full bg-red-500 text-white rounded p-2 hover:bg-red-600 ${!isCancelable(lesson) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isCancelable(lesson)}
                >
                  בטל שיעור
                </button>
              ) : (
                <button
                  onClick={() => registerForLesson(lesson)}
                  className="w-full bg-teal-500 text-white rounded p-2 hover:bg-teal-600"
                >
                  הירשם לשיעור
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