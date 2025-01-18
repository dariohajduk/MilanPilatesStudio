import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateUserData = async (data) => {
    try {
      const userRef = doc(db, 'Users', data.phone);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const docData = userDoc.data();
        setUserData({ ...docData, phone: data.phone, isAdmin: Boolean(docData.isAdmin) });
        setIsLoggedIn(true);
      } else {
        console.error('User not found in Firebase');
      }
    } catch (error) {
      console.error('Error fetching user data from Firebase:', error);
    }
  };

  const refreshUserData = async (phone) => {
    if (!phone) {
      console.error('Cannot refresh user data: phone is undefined');
      return;
    }
  
    try {
      const userRef = doc(db, 'Users', phone);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({ ...data, phone });
      } else {
        console.error('User not found in Firebase');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };
  

  const logout = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      isLoggedIn, 
      updateUserData, 
      refreshUserData, // הוסף כאן את הפונקציה
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
