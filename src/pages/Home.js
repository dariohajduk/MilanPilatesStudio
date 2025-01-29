import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useLogo } from '../contexts/LogoContext';
import { getGreeting, filterLessonsByDate, calculateWeeksSinceDate } from '../utils';

const Home = () => {
  const { userData } = useUser();
  const { logoUrl } = useLogo();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  const upcomingLessons = filterLessonsByDate(userData?.registeredLessons, today, endOfWeek);
  const pastLessonsCount = userData?.registeredLessons?.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    return lessonDate < today;
  }).length || 0;
  const lessonsPerWeek = (pastLessonsCount / calculateWeeksSinceDate(userData?.joinDate)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header and Greeting */}
      <div className="text-center bg-white rounded-lg p-8 shadow-sm">
        <div className="logo-container">
          <img
            src={logoUrl || '/default-logo.png'}
            alt="Studio Logo"
            className="logo"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {userData?.name || 'אורח'}
        </h1>
        <p className="text-gray-600 mt-2">
          ברוכים הבאים למערכת השיעורים של Milan Pilates
        </p>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Lessons */}
        <InfoBox title="השיעורים הקרובים שלך">
          {upcomingLessons.length > 0 ? (
            <ul className="space-y-3">
              {upcomingLessons.map((lesson, index) => (
                <LessonItem key={index} lesson={lesson} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              אין שיעורים קרובים השבוע
            </p>
          )}
        </InfoBox>

        {/* Statistics */}
        <InfoBox title="סטטיסטיקות">
          <Statistic label="שיעורים שהשתתפת" value={pastLessonsCount} />
          <Statistic label="כמות שיעורים עתידיים" value={upcomingLessons.length} />
          <Statistic label="ממוצע שיעורים בשבוע" value={lessonsPerWeek} />
        </InfoBox>

        {/* Membership Details */}
        <InfoBox title="פרטי מנוי">
          <Detail label="סוג מנוי" value={userData?.membershipType || 'רגיל'} />
          <Detail label="תאריך הצטרפות" value={userData?.joinDate || 'לא זמין'} />
        </InfoBox>
      </div>
    </div>
  );
};

// InfoBox Component
const InfoBox = ({ title, children }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

// LessonItem Component
const LessonItem = ({ lesson }) => (
  <li className="flex flex-col p-3 bg-gray-50 rounded-lg">
    <span className="font-bold text-gray-800">שם השיעור: {lesson.title}</span>
    <span className="text-gray-600">סוג השיעור: {lesson.type || 'לא מוגדר'}</span>
    <span className="text-gray-600">
      תאריך: {new Date(lesson.date).toLocaleDateString('he-IL')}
    </span>
    <span className="text-gray-600">שעה: {lesson.time}</span>
  </li>
);

// Statistic Component
const Statistic = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

// Detail Component
const Detail = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <span className="text-gray-600">{label}: </span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default Home;
