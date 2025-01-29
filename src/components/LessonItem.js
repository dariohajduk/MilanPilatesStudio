import React from 'react';

/**
 * Display a single lesson item.
 * @param {Object} lesson - The lesson data.
 */
const LessonItem = ({ lesson }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <h3 className="font-bold text-lg">{lesson.title || `${lesson.type} - ${lesson.instructor}`}</h3>
      <p className="text-gray-600">מדריך: {lesson.instructor}</p>
      <p className="text-gray-600">תאריך: {lesson.date}</p>
      <p className="text-gray-600">שעה: {lesson.time}</p>
    </div>
  </div>
);

export default LessonItem;
