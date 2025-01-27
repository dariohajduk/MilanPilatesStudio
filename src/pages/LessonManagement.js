import React, { useState, useEffect } from 'react';
import { useLessons } from '../contexts/LessonsContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Helper to detect if the screen is mobile-sized
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const LessonManagement = () => {
  const { lessons, addLesson, removeLesson, clearAllLessons } = useLessons();
  const [lessonTypes, setLessonTypes] = useState([]); // Store lesson types fetched from Firebase
  const isMobile = useIsMobile();

  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    instructor: '',
    type: '', // Default to empty; populate with dynamic lesson types
    maxParticipants: 0,
    date: '',
    time: '',
  });

  // Fetch lesson types from Firebase on component mount
  useEffect(() => {
    const fetchLessonTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'LessonTypes'));
        const types = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessonTypes(types); // Save fetched lesson types to state
      } catch (error) {
        console.error('Error fetching lesson types:', error);
      }
    };

    fetchLessonTypes();
  }, []);

  // Group lessons by date for mobile view
  const lessonsByDate = lessons.reduce((acc, lesson) => {
    const date = lesson.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lesson);
    return acc;
  }, {});

  // Handle selecting time slots
  const handleSelectSlot = ({ start, end }) => {
    const newSelection = [];
    let current = new Date(start);
    while (current < end) {
      const nextHour = new Date(current);
      nextHour.setHours(current.getHours() + 1);
      newSelection.push({ start: current, end: nextHour });
      current = nextHour;
    }
    setSelectedTimes((prev) => {
      const updatedSelection = prev.filter(
        (slot) =>
          !newSelection.some(
            (newSlot) => newSlot.start.getTime() === slot.start.getTime()
          )
      );
      return [
        ...updatedSelection,
        ...newSelection.filter(
          (newSlot) =>
            !prev.some((slot) => slot.start.getTime() === newSlot.start.getTime())
        ),
      ];
    });
  };

  // Add lessons
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

    const lessonsToAdd = isMobile
      ? [
          {
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
          },
        ]
      : selectedTimes.map((timeSlot) => {
          const date = moment(timeSlot.start).format('YYYY-MM-DD');
          const time = moment(timeSlot.start).format('HH:mm');
          return {
            date,
            time,
            instructor: formData.instructor,
            type: formData.type,
            maxParticipants: formData.maxParticipants.toString(),
            registeredParticipants: 0,
            createdAt: moment().toISOString(),
            title: `${formData.type} - ${formData.instructor}`,
            isActive: moment(timeSlot.start).isAfter(moment()),
            waitingList: [],
          };
        });

    try {
      for (const lesson of lessonsToAdd) {
        const docRef = await addDoc(collection(db, 'Lessons'), lesson);
        // Update local state/context
        addLesson({ id: docRef.id, ...lesson });
      }
      // Reset state after successful submission
      setSelectedTimes([]);
      setFormData({
        instructor: '',
        type: '',
        maxParticipants: 0,
        date: '',
        time: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding lessons:', error);
    }
  };

  // Delete a single lesson
  const handleDeleteLesson = (lessonId) => {
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return;
    }

    if (window.confirm('האם אתה בטוח שברצונך למחוק את השיעור?')) {
      removeLesson(lessonId);
    }
  };

  // Clear all lessons
  const handleClearAllLessons = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל השיעורים?')) {
      clearAllLessons();
    }
  };

  // Prepare events for the calendar
  const events = lessons.map((lesson) => {
    if (!lesson.id) {
      console.error("Lesson ID is missing:", lesson);
      return null;
    }
    const lessonStart = new Date(`${lesson.date}T${lesson.time}`);
    const lessonEnd = new Date(lessonStart);
    lessonEnd.setHours(lessonEnd.getHours() + 1); // Ensure lessons span 1 hour
    return {
      id: lesson.id,
      title: `${lesson.type} - ${lesson.instructor}`,
      start: lessonStart,
      end: lessonEnd,
    };
  }).filter(Boolean);

  // Custom style for selected time slots
  const timeSlotStyleGetter = (value) => {
    const isSelected = selectedTimes.some(
      ({ start }) => start.getTime() === value.getTime()
    );
    return {
      style: {
        backgroundColor: isSelected ? '#cce5ff' : 'white',
        border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ניהול שיעורים</h1>
      {!isMobile ? (
        <div className="mb-4 flex justify-end space-x-4">
          <button
            onClick={handleClearAllLessons}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            מחק את כל השיעורים
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            הגדר שיעור
          </button>
        </div>
      ) : null}

      {isMobile ? (
        // Mobile View
        <div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            הגדר שיעור
          </button>
          {Object.keys(lessonsByDate).map((date) => (
            <div key={date} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {moment(date).format('DD/MM/YYYY')}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {lessonsByDate[date]?.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col"
                  >
                    <div className="text-lg font-semibold text-gray-800">
                      {lesson.type} עם {lesson.instructor}
                    </div>
                    <div className="text-gray-600 mt-1">
                      שעה: {lesson.time}
                    </div>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      מחק
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop View
        <Calendar
          localizer={localizer}
          selectable
          onSelectSlot={handleSelectSlot}
          events={events}
          style={{
            height: 'calc(100vh - 200px)',
            width: '100%',
            fontSize: '12px',
          }}
          defaultView="week"
          views={['month', 'week', 'day']}
          step={60}
          timeslots={1}
          min={new Date(1970, 1, 1, 8, 0, 0)}
          max={new Date(1970, 1, 1, 22, 0, 0)}
          messages={{
            month: 'חודש',
            week: 'שבוע',
            day: 'יום',
            today: 'היום',
            previous: 'קודם',
            next: 'הבא',
          }}
          components={{
            event: ({ event }) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{event.title}</span>
                <button
                  onClick={() => handleDeleteLesson(event.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  מחק
                </button>
              </div>
            ),
            timeSlotWrapper: ({ children, value }) => {
              const styleProps = timeSlotStyleGetter(value);
              return <div style={styleProps.style}>{children}</div>;
            },
          }}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">הוסף שיעור</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="שם המדריך"
                value={formData.instructor}
                onChange={(e) =>
                  setFormData({ ...formData, instructor: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="" disabled>
                  בחר סוג שיעור
                </option>
                {lessonTypes.map((type) => (
                  <option key={type.id} value={type.type}>
                    {type.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <input
                type="number"
                placeholder="מספר משתתפים מקסימלי"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            {isMobile ? (
              <div className="mb-4">
                <input
                  type="date"
                  placeholder="תאריך השיעור"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            ) : null}
            {isMobile ? (
              <div className="mb-4">
                <input
                  type="time"
                  placeholder="שעת השיעור"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            ) : null}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                ביטול
              </button>
              <button
                onClick={handleAddLessons}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                הוסף
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
