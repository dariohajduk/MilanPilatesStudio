import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase'; // Ensure your Firebase setup is correct
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const LessonsContext = createContext();

export const LessonsProvider = ({ children }) => {
  const [lessons, setLessons] = useState([]);

  // Fetch lessons from Firebase
  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsCollection = collection(db, 'Lessons');
      const lessonSnapshot = await getDocs(lessonsCollection);
      const lessonList = lessonSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLessons(lessonList);
    };
    fetchLessons();
  }, []);

  // Add a lesson to Firebase
  const addLesson = async (lesson) => {
    const lessonsCollection = collection(db, 'Lessons');
    const docRef = await addDoc(lessonsCollection, lesson);
    setLessons((prev) => [...prev, { id: docRef.id, ...lesson }]);
  };

  // Remove a single lesson from Firebase
  const removeLesson = async (lessonId) => {
    await deleteDoc(doc(db, 'Lessons', lessonId));
    setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
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
    <LessonsContext.Provider
      value={{ lessons, addLesson, removeLesson, clearAllLessons }}
    >
      {children}
    </LessonsContext.Provider>
  );
};

export const useLessons = () => {
  return useContext(LessonsContext);
};
