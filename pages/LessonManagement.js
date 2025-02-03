import React, { useState, useEffect } from 'react';
import { useLessons } from '../src/contexts/LessonsContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") { // ✅ בדיקה ש`window` קיים
      setIsMobile(window.innerWidth < 1024);
      const handleResize = () => setIsMobile(window.innerWidth < 1024);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return isMobile;
};

const LessonManagement = () => {
  const { lessons = [], addLesson, removeLesson } = useLessons() || {}; // ✅ הוספת בדיקה למניעת קריסות
  const [lessonTypes, setLessonTypes] = useState([]);
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    instructor: '',
    type: '',
    maxParticipants: 0,
    date: '',
    time: '',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const typesSnapshot = await getDocs(collection(db, 'LessonTypes'));
        if (!isMounted) return;

        setLessonTypes(typesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const lessonsRef = collection(db, 'Lessons');
        const lessonsSnapshot = await getDocs(lessonsRef);
        if (!isMounted) return;

        const fetchedLessons = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const existingLessonIds = lessons.map(lesson => lesson.id);

        fetchedLessons.forEach(lesson => {
          if (lesson.id && !existingLessonIds.includes(lesson.id)) {
            addLesson(lesson);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [lessons, addLesson]);

  const handleAddLessons = async () => {
    if (
      formData.instructor.trim() === '' ||
      formData.type.trim() === '' ||
      formData.maxParticipants <= 0 ||
      (isMobile && (formData.date === '' || formData.time === ''))
    ) {
      alert('אנא מלא את כל השדות בטופס');
      return;
    }

    const newLesson = {
      date: formData.date,
      time: formData.time,
      instructor: formData.instructor,
      type: formData.type,
      maxParticipants: formData.maxParticipants.toString(),
      registeredParticipants: 0,
      createdAt: moment().toISOString(),
      title: `${formData.type} - ${formData.instructor}`,
      isActive: moment(`${formData.date}T${formData.time}`).isAfter(moment()),
      waitingList: [],
    };

    try {
      const docRef = await addDoc(collection(db, 'Lessons'), newLesson);
      addLesson({ id: docRef.id, ...newLesson });

      setFormData({ instructor: '', type: '', maxParticipants: 0, date: '', time: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding lesson:', error);
      alert('אירעה שגיאה בהוספת השיעור');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ניהול שיעורים</h1>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        הוסף שיעור
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">הוסף שיעור</h2>
            <input
              type="text"
              placeholder="שם המדריך"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="w-full p-2 border rounded-lg mb-2"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg mb-2"
            >
              <option value="" disabled>בחר סוג שיעור</option>
              {lessonTypes.map((type) => (
                <option key={type.id} value={type.type}>{type.type}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="מספר משתתפים מקסימלי"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded-lg mb-2"
              min="1"
              required
            />
            {isMobile && (
              <>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-2"
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-2"
                  required
                />
              </>
            )}
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">ביטול</button>
              <button onClick={handleAddLessons} className="px-4 py-2 bg-green-500 text-white rounded-lg">הוסף</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
