import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase'; // Ensure your Firebase setup is correct
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const LessonsContext = createContext();

export const LessonsProvider = ({ children }) => {
  const [lessons, setLessons] = useState([]);

  // Fetch lessons from Firebase
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsCollection = collection(db, 'Lessons');
        const lessonSnapshot = await getDocs(lessonsCollection);
        const lessonList = lessonSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Lessons from Firestore:", lessonList); // Debugging
        setLessons(lessonList);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };
    fetchLessons();
  }, []);

  // Add a lesson (local state only)
  const addLesson = (lesson) => {
    setLessons((prev) => [...prev, lesson]);
  };

  // Remove a single lesson from Firebase
  const removeLesson = async (lessonId) => {
    if (!lessonId) {
      console.error('Invalid lessonId:', lessonId);
      return;
    }
    try {
      await deleteDoc(doc(db, 'Lessons', lessonId));
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error('Error removing lesson:', error);
    }
  };

  // Clear all lessons from Firebase
  const clearAllLessons = async () => {
    const lessonsCollection = collection(db, 'Lessons');
    const lessonSnapshot = await getDocs(lessonsCollection);
    const batchDelete = lessonSnapshot.docs.map((lessonDoc) =>
      deleteDoc(doc(db, 'Lessons', lessonDoc.id))
    );
    await Promise.all(batchDelete);
    setLessons([]);
  };

  return (
    <LessonsContext.Provider value={{ lessons, addLesson, removeLesson, clearAllLessons }}>
      {children}
    </LessonsContext.Provider>
  );
};

export const useLessons = () => {
  return useContext(LessonsContext);
};