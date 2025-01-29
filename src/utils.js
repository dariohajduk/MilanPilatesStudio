// פונקציה לעדכון סטייט בטפסים
export const updateFormState = (e, stateUpdater) => {
    const { name, value, type, checked } = e.target;
    stateUpdater((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // פונקציה לטיפול בקריאת API עם Firebase
  export const handleFirebaseOperation = async (operation, data, onSuccess, onError) => {
    try {
      const result = await operation(data);
      onSuccess(result);
    } catch (error) {
      console.error('Error:', error);
      if (onError) onError(error);
    }
  };
  
  // פונקציה להצגת התראות בצורה אחידה
  export const showAlert = (message) => {
    alert(message);
  };
  
  // Utility functions for date and lesson-related calculations
// These functions can be reused across multiple components to avoid code duplication

/**
 * Returns a greeting message based on the current hour of the day.
 * @returns {string} - Greeting message in Hebrew.
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
};

/**
 * Filters lessons that fall between a given start and end date.
 * @param {Array} lessons - List of lesson objects.
 * @param {Date} startDate - Start date for the filter.
 * @param {Date} endDate - End date for the filter.
 * @returns {Array} - Filtered list of lessons within the date range.
 */
export const filterLessonsByDate = (lessons, startDate, endDate) => {
  return lessons?.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    return lessonDate >= startDate && lessonDate <= endDate;
  }) || [];
};

/**
 * Calculates the number of weeks since a given start date.
 * @param {string} startDate - ISO string representing the start date.
 * @returns {number} - Number of weeks since the start date (minimum 1 week).
 */
export const calculateWeeksSinceDate = (startDate) => {
  if (!startDate) return 1; // Default to 1 week if no start date is provided
  const today = new Date();
  const diffInMilliseconds = today - new Date(startDate);
  const diffInWeeks = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
  return diffInWeeks > 0 ? diffInWeeks : 1; // Ensure at least 1 week to avoid division by zero
};

/**
 * Calculates the total number of participants in a given set of lessons.
 * @param {Array} lessons - List of lesson objects.
 * @returns {number} - Total number of participants.
 */
export const calculateTotalParticipants = (lessons) => {
  return lessons?.reduce((acc, lesson) => acc + (lesson.registeredParticipants || 0), 0);
};

/**
 * Validates an Israeli phone number format.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
export const validatePhone = (phoneNumber) => {
  const phoneRegex = /^05\d{8}$/; // Match numbers starting with 05 followed by 8 digits
  return phoneRegex.test(phoneNumber);
};