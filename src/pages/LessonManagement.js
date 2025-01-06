import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LessonManagement = ({ addLesson }) => {
  const [lesson, setLesson] = useState({
    date: '',
    hour: '',
    numberOfPersons: '',
    trainType: '',
    trainerName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLesson((prevLesson) => ({ ...prevLesson, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'Lessons'), lesson);
      console.log('Lesson added with ID:', docRef.id);
      addLesson({ id: docRef.id, ...lesson });
      setLesson({
        date: '',
        hour: '',
        numberOfPersons: '',
        trainType: '',
        trainerName: '',
      });
    } catch (error) {
      console.error('Error adding lesson:', error);
      alert('שגיאה בהוספת שיעור.');
    }
  };

  return (
    <div className="lesson-management container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ניהול שיעורים</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">תאריך</label>
          <input
            type="date"
            name="date"
            value={lesson.date}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">שעה</label>
          <input
            type="time"
            name="hour"
            value={lesson.hour}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">מספר משתתפים</label>
          <input
            type="number"
            name="numberOfPersons"
            value={lesson.numberOfPersons}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">סוג אימון</label>
          <input
            type="text"
            name="trainType"
            value={lesson.trainType}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">שם המדריך</label>
          <input
            type="text"
            name="trainerName"
            value={lesson.trainerName}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          הוסף שיעור
        </button>
      </form>
    </div>
  );
};

export default LessonManagement;
