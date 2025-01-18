import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const ManagerPage = () => {
  const [lessonTypes, setLessonTypes] = useState([]);
  const [newLessonType, setNewLessonType] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [newMembership, setNewMembership] = useState('');

  useEffect(() => {
    fetchLessonTypes();
    fetchMemberships();
  }, []);

  const fetchLessonTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'LessonTypes'));
      const types = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLessonTypes(types);
    } catch (error) {
      console.error('Error fetching lesson types:', error);
    }
  };

  const fetchMemberships = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Memberships'));
      const membershipsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemberships(membershipsList);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  const addLessonType = async () => {
    try {
      const newDoc = await addDoc(collection(db, 'LessonTypes'), { name: newLessonType });
      setLessonTypes([...lessonTypes, { id: newDoc.id, name: newLessonType }]);
      setNewLessonType('');
    } catch (error) {
      console.error('Error adding lesson type:', error);
    }
  };

  const addMembership = async () => {
    try {
      const newDoc = await addDoc(collection(db, 'Memberships'), { name: newMembership });
      setMemberships([...memberships, { id: newDoc.id, name: newMembership }]);
      setNewMembership('');
    } catch (error) {
      console.error('Error adding membership:', error);
    }
  };

  const deleteLessonType = async (id) => {
    try {
      await deleteDoc(doc(db, 'LessonTypes', id));
      setLessonTypes(lessonTypes.filter((type) => type.id !== id));
    } catch (error) {
      console.error('Error deleting lesson type:', error);
    }
  };

  const deleteMembership = async (id) => {
    try {
      await deleteDoc(doc(db, 'Memberships', id));
      setMemberships(memberships.filter((membership) => membership.id !== id));
    } catch (error) {
      console.error('Error deleting membership:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ניהול סוגי שיעורים ומנויים</h1>

      {/* Lesson Types Management */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">ניהול סוגי שיעורים</h2>
        <input
          type="text"
          value={newLessonType}
          onChange={(e) => setNewLessonType(e.target.value)}
          placeholder="הוסף סוג שיעור חדש"
          className="p-2 border rounded w-full"
        />
        <button
          onClick={addLessonType}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          הוסף סוג שיעור
        </button>
        <ul className="mt-4 space-y-2">
          {lessonTypes.map((type) => (
            <li key={type.id} className="flex justify-between items-center border p-2 rounded">
              <span>{type.name}</span>
              <button
                onClick={() => deleteLessonType(type.id)}
                className="text-red-500"
              >
                מחק
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Memberships Management */}
      <div>
        <h2 className="text-xl font-bold mb-4">ניהול מנויים</h2>
        <input
          type="text"
          value={newMembership}
          onChange={(e) => setNewMembership(e.target.value)}
          placeholder="הוסף מנוי חדש"
          className="p-2 border rounded w-full"
        />
        <button
          onClick={addMembership}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          הוסף מנוי
        </button>
        <ul className="mt-4 space-y-2">
          {memberships.map((membership) => (
            <li key={membership.id} className="flex justify-between items-center border p-2 rounded">
              <span>{membership.name}</span>
              <button
                onClick={() => deleteMembership(membership.id)}
                className="text-red-500"
              >
                מחק
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManagerPage;
