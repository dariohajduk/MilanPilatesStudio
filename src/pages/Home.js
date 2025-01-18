  import React from 'react';
  import { useUser } from '../contexts/UserContext';
  import { useLogo } from '../contexts/LogoContext'; // Import your LogoContext

  const Home = () => {
    const { userData } = useUser();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Calculate end of the current week
    const { logoUrl } = useLogo(); // Get logoUrl from context

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'בוקר טוב';
      if (hour < 17) return 'צהריים טובים';
      if (hour < 21) return 'ערב טוב';
      return 'לילה טוב';
    };

    const upcomingLessons = userData?.registeredLessons?.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= today && lessonDate <= endOfWeek;
    }) || [];

    const pastLessonsCount = userData?.registeredLessons?.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate < today;
    }).length || 0;

    const weeksSinceJoining = (() => {
      if (!userData?.joinDate) return 0;
      const joinDate = new Date(userData.joinDate);
      const diffInMilliseconds = today - joinDate;
      const diffInWeeks = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
      return diffInWeeks > 0 ? diffInWeeks : 1; // Ensure at least 1 week to avoid division by zero
    })();

    const lessonsPerWeek = (pastLessonsCount / weeksSinceJoining).toFixed(2);

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
            {getGreeting()}, {userData?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            ברוכים הבאים למערכת השיעורים של Milan Pilates
          </p>
        </div>

        {/* קופסאות מידע */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* שיעורים קרובים */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">השיעורים הקרובים שלך</h2>
            {upcomingLessons.length > 0 ? (
              <ul className="space-y-3">
                {upcomingLessons.map((lesson, index) => (
                  <li key={index} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-800">שם השיעור: {lesson.title}</span>
                    <span className="text-gray-600">סוג השיעור: {lesson.type || 'לא מוגדר'}</span>
                    <span className="text-gray-600">תאריך: {new Date(lesson.date).toLocaleDateString('he-IL')}</span>
                    <span className="text-gray-600">שעה: {lesson.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                אין שיעורים קרובים השבוע
              </p>
            )}
          </div>

          {/* סטטיסטיקות */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">סטטיסטיקות</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">שיעורים שהשתתפת</span>
                <span className="font-semibold">{pastLessonsCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">כמות שיעורים עתידיים</span>
                <span className="font-semibold">{upcomingLessons.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">ממוצע שיעורים בשבוע</span>
                <span className="font-semibold">{lessonsPerWeek}</span>
              </div>
            </div>
          </div>

          {/* פרטי מנוי */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">פרטי מנוי</h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">סוג מנוי: </span>
                <span className="font-semibold">{userData?.membershipType || 'רגיל'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">תאריך הצטרפות: </span>
                <span className="font-semibold">{userData?.joinDate || 'לא זמין'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Home;
