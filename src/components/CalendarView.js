import React, { useState } from 'react';

const CalendarView = ({ lessons, onEditLesson }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00-20:00

  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const handleDragStart = (e, lesson) => {
    e.dataTransfer.setData('lesson', JSON.stringify(lesson));
  };

  const handleDrop = async (e, date, hour) => {
    e.preventDefault();
    const lessonData = JSON.parse(e.dataTransfer.getData('lesson'));
    const newDate = new Date(date);
    newDate.setHours(hour);
    
    onEditLesson({
      ...lessonData,
      date: newDate.toISOString()
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
      <div className="grid grid-cols-8 gap-2 min-w-max">
        {/* Time Column */}
        <div className="border-l">
          <div className="h-10"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b px-2 py-1 text-sm text-gray-600">
              {`${hour}:00`}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {getWeekDates(selectedWeek).map((date, dayIndex) => (
          <div key={dayIndex} className="flex-1 min-w-[120px]">
            <div className="h-12 text-center font-medium border-b">
              <div>{daysOfWeek[dayIndex]}</div>
              <div className="text-sm text-gray-500">
                {date.toLocaleDateString('he-IL')}
              </div>
            </div>

            {hours.map(hour => (
              <div
                key={hour}
                className="h-16 border-b relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, date, hour)}
              >
                {lessons
                  .filter(lesson => {
                    const lessonDate = new Date(lesson.date);
                    return (
                      lessonDate.getDate() === date.getDate() &&
                      lessonDate.getMonth() === date.getMonth() &&
                      lessonDate.getHours() === hour
                    );
                  })
                  .map((lesson, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lesson)}
                      className="absolute inset-1 bg-blue-100 text-blue-800 
                               rounded p-1 text-xs cursor-move overflow-hidden"
                    >
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-blue-600">{lesson.instructor}</div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;