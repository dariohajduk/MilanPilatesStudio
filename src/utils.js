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
  