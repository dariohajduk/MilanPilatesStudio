import React from 'react';

// Utility function to format date to "Weekday, DD-MM-YYYY"
const formatDateWithWeekday = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('he-IL', options).format(date); // 'he-IL' formats in Hebrew locale
  };
  

const LessonCard = ({ lesson, isRegistered, onRegister, onCancel }) => {
     // Format the lesson date
  const formattedDate = formatDateWithWeekday(lesson.date);
  return (
  <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col">
    <div className="text-lg font-semibold text-gray-800">
      {formattedDate}
    </div>
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
        onClick={() => onCancel(lesson)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        בטל הרשמה
      </button>
    ) : (
      <button
        onClick={() => onRegister(lesson)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        הירשם לשיעור
      </button>
    )}
  </div>
);};


export default LessonCard;
