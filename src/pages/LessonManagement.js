import React, { useState } from 'react';

const LessonManagement = ({ addLesson }) => {
  const [newLesson, setNewLesson] = useState({ date: '', hour: '', trainerName: '', maxParticipants: '', type: '' });

  const handleAddLesson = () => {
    if (newLesson.date && newLesson.hour && newLesson.trainerName && newLesson.maxParticipants && newLesson.type) {
      addLesson(newLesson);
      setNewLesson({ date: '', hour: '', trainerName: '', maxParticipants: '', type: '' });
    } else {
      alert('אנא מלא את כל השדות עבור השיעור החדש.');
    }
  };

  return (
    <div className="lesson-management p-8">
      <h1 className="text-3xl font-bold mb-6">ניהול שיעורים</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">תאריך</label>
            <input
              type="date"
              value={newLesson.date}
              onChange={(e) => setNewLesson({ ...newLesson, date: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">שעה</label>
            <input
              type="time"
              value={newLesson.hour}
              onChange={(e) => setNewLesson({ ...newLesson, hour: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">שם המדריך</label>
            <input
              type="text"
              value={newLesson.trainerName}
              onChange={(e) => setNewLesson({ ...newLesson, trainerName: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">כמות מקסימלית של משתתפים</label>
            <input
              type="number"
              value={newLesson.maxParticipants}
              onChange={(e) => setNewLesson({ ...newLesson, maxParticipants: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">סוג האימון</label>
            <input
              type="text"
              value={newLesson.type}
              onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <button onClick={handleAddLesson} className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
            הוסף שיעור
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonManagement;