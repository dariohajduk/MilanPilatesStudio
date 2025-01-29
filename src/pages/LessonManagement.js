import React, { useState, useEffect } from 'react';
import { useLessons } from '../contexts/LessonsContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const LessonManagement = () => {
  const { lessons, addLesson, removeLesson, clearAllLessons } = useLessons();
  const [lessonTypes, setLessonTypes] = useState([]);
  const isMobile = useIsMobile();
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    instructor: '',
    type: '',
    maxParticipants: 0,
    date: '',
    time: '',
  });

  // Fetch both lesson types and lessons
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch lesson types
        const typesSnapshot = await getDocs(collection(db, 'LessonTypes'));
        if (!isMounted) return;
        
        const types = typesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessonTypes(types);

        // Fetch ALL lessons
        const lessonsRef = collection(db, 'Lessons');
        const lessonsSnapshot = await getDocs(lessonsRef);
        if (!isMounted) return;

        // Add new lessons only if they don't exist in context
        const fetchedLessons = lessonsSnapshot.docs.map(doc => {
          const lesson = {
            id: doc.id,
            ...doc.data()
          };
          console.log('Fetched lesson:', {
            id: lesson.id,
            date: lesson.date,
            time: lesson.time,
            isActive: lesson.isActive,
            type: lesson.type
          });
          return lesson;
        });

        console.log('Current lessons in context:', lessons.map(l => ({
          id: l.id,
          date: l.date,
          time: l.time,
          isActive: l.isActive,
          type: l.type
        })));

        // Get existing lesson IDs
        const existingLessonIds = lessons.map(lesson => lesson.id);

        // Only add lessons that don't already exist in context
        fetchedLessons.forEach(lesson => {
          if (lesson.id && !existingLessonIds.includes(lesson.id)) {
            console.log('Adding new lesson to context:', {
              id: lesson.id,
              date: lesson.date,
              time: lesson.time,
              isActive: lesson.isActive,
              type: lesson.type
            });
            addLesson(lesson);
          }
        });

        // Log final state
        console.log('Total lessons after update:', lessons.length);
        console.log('Active lessons:', lessons.filter(l => l.isActive).length);
        console.log('Historical lessons:', lessons.filter(l => !l.isActive).length);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [lessons]);

  // Separate current and past lessons based on isActive flag
  const { currentLessons, pastLessons } = lessons.reduce(
    (acc, lesson) => {
      if (lesson.isActive) {
        acc.currentLessons.push(lesson);
      } else {
        acc.pastLessons.push(lesson);
      }
      return acc;
    },
    { currentLessons: [], pastLessons: [] }
  );

  // Group lessons by date for mobile view
  const groupLessonsByDate = (lessonList) => {
    return lessonList.reduce((acc, lesson) => {
      const date = lesson.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(lesson);
      return acc;
    }, {});
  };

  const currentLessonsByDate = groupLessonsByDate(currentLessons);
  const pastLessonsByDate = groupLessonsByDate(pastLessons);

  const handleSelectSlot = ({ start, end }) => {
    // Check if the selected time is in the past
    if (!moment(start).isAfter(moment())) {
      alert('לא ניתן להוסיף שיעורים בתאריכים שעברו');
      return;
    }

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

    // Check for existing lessons at the same time
    const checkForExistingLesson = (date, time) => {
      return lessons.some(
        (lesson) => lesson.date === date && lesson.time === time
      );
    };

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
            isActive: true,
            waitingList: [],
          };
        });

    try {
      // Filter out any time slots that already have lessons
      const validLessons = lessonsToAdd.filter(
        (lesson) => !checkForExistingLesson(lesson.date, lesson.time)
      );

      if (validLessons.length === 0) {
        alert('כל השעות שנבחרו כבר תפוסות');
        return;
      }

      if (validLessons.length < lessonsToAdd.length) {
        alert('חלק מהשעות שנבחרו כבר תפוסות. רק השעות הפנויות יתווספו.');
      }

      for (const lesson of validLessons) {
        const docRef = await addDoc(collection(db, 'Lessons'), lesson);
        console.log('Added new lesson:', { id: docRef.id, ...lesson });
        addLesson({ id: docRef.id, ...lesson });
      }

      // Reset form and selection only after successful add
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
      alert('אירעה שגיאה בהוספת השיעורים');
    }
  };

  const handleDeleteLesson = (lesson) => {
    if (!lesson.isActive) {
      alert('לא ניתן למחוק שיעורים שכבר התקיימו');
      return;
    }

    if (window.confirm('האם אתה בטוח שברצונך למחוק את השיעור?')) {
      removeLesson(lesson.id);
    }
  };

  const handleClearAllLessons = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל השיעורים העתידיים?')) {
      // Only clear future lessons
      currentLessons.forEach(lesson => removeLesson(lesson.id));
    }
  };

  // Include all lessons in events, using isActive flag
  const events = lessons
    .sort((a, b) => moment(`${a.date}T${a.time}`).diff(moment(`${b.date}T${b.time}`)))
    .map((lesson) => {
      if (!lesson.id) {
        console.error("Lesson ID is missing:", lesson);
        return null;
      }
      const lessonStart = new Date(`${lesson.date}T${lesson.time}`);
      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getHours() +35);

      return {
        id: lesson.id,
        title: `${lesson.type} - ${lesson.instructor}`,
        start: lessonStart,
        end: lessonEnd,
        isPast: !lesson.isActive,
        lesson: lesson,
      };
    })
    .filter(Boolean);

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

  const eventStyleGetter = (event) => {
    if (event.isPast) {
      return {
        style: {
          backgroundColor: '#E5E7EB', // Gray background
          color: '#4B5563', // Dark text
          border: '1px solid #D1D5DB',
          borderLeft: '4px solid #9CA3AF',
          opacity: 0.85,
          cursor: 'default',
        },
      };
    }
    return {
      style: {
        backgroundColor: '#93C5FD',
        color: '#1E3A8A',
        border: '1px solid #60A5FA',
        borderLeft: '4px solid #3B82F6',
      },
    };
  };
  

  const LessonCard = ({ lesson, isPast }) => (
    <div
      className={`bg-white shadow-lg rounded-lg p-4 border ${
        isPast ? 'border-gray-300 opacity-70' : 'border-gray-200'
      } flex flex-col`}
    >
      <div className="text-lg font-semibold text-gray-800">
        {lesson.type} עם {lesson.instructor}
      </div>
      <div className="text-gray-600 mt-1">
        שעה: {lesson.time}
      </div>
      {!isPast && (
        <button
          onClick={() => handleDeleteLesson(lesson)}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          מחק
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ניהול שיעורים</h1>
      
      {!isMobile ? (
        <div className="mb-4 flex justify-end space-x-4">
          <button
            onClick={handleClearAllLessons}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            מחק את כל השיעורים העתידיים
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            הגדר שיעור
          </button>
        </div>
      ) : (
        <div className="mb-4 space-y-2">
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            הגדר שיעור
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            {showHistory ? 'הצג שיעורים עתידיים' : 'הצג היסטוריית שיעורים'}
          </button>
        </div>
      )}

      {isMobile ? (
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {showHistory ? 'היסטוריית שיעורים' : 'שיעורים קרובים'}
              </h2>
              <span className="text-sm text-gray-500">
                {showHistory 
                  ? `${Object.keys(pastLessonsByDate).length} ימים` 
                  : `${Object.keys(currentLessonsByDate).length} ימים`}
              </span>
            </div>
          </div>
          
          {showHistory ? (
            // Past lessons (History)
            Object.keys(pastLessonsByDate)
              .sort((a, b) => moment(b).diff(moment(a)))
              .map((date) => (
                <div key={date} className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">
                    {moment(date).format('DD/MM/YYYY')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pastLessonsByDate[date]
                      ?.sort((a, b) => moment(`${a.date}T${a.time}`).diff(moment(`${b.date}T${b.time}`)))
                      .map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} isPast={true} />
                      ))}
                  </div>
                </div>
              ))
          ) : (
            // Current lessons
            Object.keys(currentLessonsByDate)
              .sort((a, b) => moment(a).diff(moment(b)))
              .map((date) => (
                <div key={date} className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-blue-900">
                    {moment(date).format('DD/MM/YYYY')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentLessonsByDate[date]
                      ?.sort((a, b) => moment(`${a.date}T${a.time}`).diff(moment(`${b.date}T${b.time}`)))
                      .map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} isPast={false} />
                      ))}
                  </div>
                </div>
              ))
          )}
          
          {((showHistory && Object.keys(pastLessonsByDate).length === 0) ||
            (!showHistory && Object.keys(currentLessonsByDate).length === 0)) && (
            <div className="text-center py-8 text-gray-500">
              {showHistory ? 'אין שיעורים בהיסטוריה' : 'אין שיעורים קרובים'}
            </div>
          )}
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          selectable
          onSelectSlot={handleSelectSlot}
          events={events}
          style={{
            height: 'calc(100vh - 200px)',
            width: '100%',
            fontSize: '8px',
          }}
          defaultView="week"
          views={['month', 'week', 'day']}
          step={60}
          timeslots={1}
          min={new Date(1970, 1, 1, 8, 0, 0)}
          max={new Date(1970, 1, 1, 23, 0, 0)}
          messages={{
            month: 'חודש',
            week: 'שבוע',
            day: 'יום',
            today: 'היום',
            previous: 'קודם',
            next: 'הבא',
          }}
          eventPropGetter={(event) => {
            const isSelected = selectedTimes.some(
              (time) => time.start.getTime() === event.start.getTime()
            );
            return{
            style: {
              backgroundColor: isSelected ? '#cce5ff' : '#93C5FD',
              color: '#1E3A8A',
              border: '1px solid #60A5FA',
              borderLeft: '1px solid #3B82F6',
              display: 'flex-inline',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1px',
              marginLeft: '5px',
            },
          };}}
          components={{
            event: ({ event }) => (
              <div
                style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '2px 4px',
                }}
              >
                <strong>{event.title}</strong>
                {event.lesson?.isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLesson(event.lesson);
                    }}
                    className="bg-red-500 text-white  px-2 py-1 rounded hover:bg-red-600"
                  >
                    מחק
                  </button>
                )}
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
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
                  setFormData({
                    ...formData,
                    maxParticipants: parseInt(e.target.value) || 0
                  })
                }
                className="w-full p-2 border rounded-lg"
                min="1"
                required
              />
            </div>
            {isMobile && (
              <>
                <div className="mb-4">
                  <input
                    type="date"
                    placeholder="תאריך השיעור"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={moment().format('YYYY-MM-DD')}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
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
              </>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ביטול
              </button>
              <button
                onClick={handleAddLessons}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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