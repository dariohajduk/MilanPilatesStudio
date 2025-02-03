import React from 'react';
import { useUser } from '../src/contexts/UserContext';
import { useLogo } from '../src/contexts/LogoContext';

const Home = () => {
  const { userData } = useUser();
  const { logoUrl } = useLogo();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  // פונקציה לברכה דינמית
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  // חישוב שיעורים קרובים
  const calculateUpcomingLessons = () =>
    userData?.registeredLessons?.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate <= endOfWeek;
    }) || [];

  // חישוב שיעורים עברו
  const calculatePastLessonsCount = () =>
    userData?.registeredLessons?.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate < today;
    }).length || 0;

  // חישוב ממוצע שיעורים בשבוע
  const calculateLessonsPerWeek = (pastLessonsCount) => {
    const joinDate = userData?.joinDate ? new Date(userData.joinDate) : today;
    const diffInMilliseconds = today - joinDate;
    const diffInWeeks = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
    return (pastLessonsCount / (diffInWeeks > 0 ? diffInWeeks : 1)).toFixed(2);
  };

  // נתוני חישוב
  const upcomingLessons = calculateUpcomingLessons();
  const pastLessonsCount = calculatePastLessonsCount();
  const lessonsPerWeek = calculateLessonsPerWeek(pastLessonsCount);

  return (
    <div className="space-y-6">
      {/* כותרת וברכה */}
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

      {/* קופסאות מידע */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* שיעורים קרובים */}
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

        {/* סטטיסטיקות */}
        <InfoBox title="סטטיסטיקות">
          <Statistic label="שיעורים שהשתתפת" value={pastLessonsCount} />
          <Statistic label="כמות שיעורים עתידיים" value={upcomingLessons.length} />
          <Statistic label="ממוצע שיעורים בשבוע" value={lessonsPerWeek} />
        </InfoBox>

        {/* פרטי מנוי */}
        <InfoBox title="פרטי מנוי">
          <Detail label="סוג מנוי" value={userData?.membershipType || 'רגיל'} />
          <Detail label="תאריך הצטרפות" value={userData?.joinDate || 'לא זמין'} />
        </InfoBox>
      </div>
    </div>
  );
};

// קומפוננטת פרטי מידע
const InfoBox = ({ title, children }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

// קומפוננטת שיעור
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

// קומפוננטת סטטיסטיקה
const Statistic = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

// קומפוננטת פרטים
const Detail = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <span className="text-gray-600">{label}: </span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default Home;
