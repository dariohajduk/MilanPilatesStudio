import React from 'react';

const Home = ({ user, lessons, logo }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  const futureLessons = Array.isArray(lessons)
    ? lessons.filter(lesson => new Date(`${lesson.date}T${lesson.hour}`) > new Date()).slice(0, 3)
    : [];

  const completedLessonsCount = Array.isArray(lessons)
    ? lessons.filter(lesson => new Date(`${lesson.date}T${lesson.hour}`) < new Date()).length
    : 0;

  return (
    <div className="home p-8 text-center">
      {logo && (
        <img
          src={logo}
          alt="Logo"
          className="mx-auto mb-6 opacity-50"
          style={{ width: '200px', height: '200px' }}
        />
      )}

      <h1 className="text-3xl font-bold mb-4">
        {getGreeting()}, {user?.name}
      </h1>

      <h2 className="text-2xl font-bold mb-6">השיעורים הקרובים שלך</h2>
      <ul className="space-y-4">
        {futureLessons.length > 0 ? (
          futureLessons.map((lesson, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow">
              <p><strong>תאריך:</strong> {lesson.date}</p>
              <p><strong>שעה:</strong> {lesson.hour}</p>
              <p><strong>סוג:</strong> {lesson.type}</p>
              <p><strong>שם המדריך:</strong> {lesson.trainerName}</p>
            </li>
          ))
        ) : (
          <p>אין שיעורים קרובים.</p>
        )}
      </ul>

      <h2 className="text-2xl font-bold mt-8">
        כמות השיעורים שבוצעה עד היום: {completedLessonsCount}
      </h2>
    </div>
  );
};

export default Home;
