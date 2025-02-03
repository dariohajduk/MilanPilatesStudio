import React, { useState, useEffect } from 'react';
import { fetchCollection, addDocument, deleteDocument } from '../src/services/firebaseService';

const ManagerPage = () => {
  const [lessonTypes, setLessonTypes] = useState([]);
  const [newLessonType, setNewLessonType] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [newMembership, setNewMembership] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLessonTypes();
    fetchMemberships();
  }, []);

  const fetchLessonTypes = async () => {
    try {
      const types = await fetchCollection('LessonTypes');
      setLessonTypes(types);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchMemberships = async () => {
    try {
      const membershipsList = await fetchCollection('Memberships');
      setMemberships(membershipsList);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error(error);
    setError('אירעה שגיאה, נסו שוב מאוחר יותר.');
  };

  const handleAddLessonType = async () => {
    if (!newLessonType.trim()) {
      setError('שם סוג שיעור אינו יכול להיות ריק.');
      return;
    }

    setIsLoading(true);
    try {
      const newType = await addDocument('LessonTypes', { name: newLessonType.trim() });
      setLessonTypes([...lessonTypes, newType]);
      setNewLessonType('');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembership = async () => {
    if (!newMembership.trim()) {
      setError('שם מנוי אינו יכול להיות ריק.');
      return;
    }

    setIsLoading(true);
    try {
      const newMembershipData = await addDocument('Memberships', { name: newMembership.trim() });
      setMemberships([...memberships, newMembershipData]);
      setNewMembership('');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLessonType = async (id) => {
    setIsLoading(true);
    try {
      await deleteDocument('LessonTypes', id);
      setLessonTypes(lessonTypes.filter((type) => type.id !== id));
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMembership = async (id) => {
    setIsLoading(true);
    try {
      await deleteDocument('Memberships', id);
      setMemberships(memberships.filter((membership) => membership.id !== id));
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ניהול סוגי שיעורים ומנויים</h1>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

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
          onClick={handleAddLessonType}
          disabled={isLoading || !newLessonType.trim()}
          className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? 'מוסיף...' : 'הוסף סוג שיעור'}
        </button>
        <EditableList items={lessonTypes} onDelete={handleDeleteLessonType} />
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
          onClick={handleAddMembership}
          disabled={isLoading || !newMembership.trim()}
          className={`bg-green-500 text-white px-4 py-2 rounded mt-2 ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? 'מוסיף...' : 'הוסף מנוי'}
        </button>
        <EditableList items={memberships} onDelete={handleDeleteMembership} />
      </div>
    </div>
  );
};

// EditableList Component
const EditableList = ({ items, onDelete }) => (
  <ul className="mt-4 space-y-2">
    {items.map((item) => (
      <li key={item.id} className="flex justify-between items-center border p-2 rounded">
        <span>{item.name}</span>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500"
        >
          מחק
        </button>
      </li>
    ))}
  </ul>
);

export default ManagerPage;
