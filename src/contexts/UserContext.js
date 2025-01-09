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

  const logout = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      isLoggedIn,
      updateUserData,
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);