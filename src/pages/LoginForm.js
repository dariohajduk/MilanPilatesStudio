// src/pages/LoginForm.js
import React, { useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';
import { useLogo } from '../contexts/LogoContext';

const LoginForm = ({ setCurrentScreen }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUserData } = useUser();
  const { logoUrl } = useLogo();

  // קבועים למנהל מערכת
  const ADMIN = {
    phone: '0500000000',
    name: 'מנהל מערכת',
    isAdmin: true,
  };

  // בדיקת תקינות מספר טלפון
  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^05\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  // טיפול בשינוי בשדה הטלפון
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // רק מספרים
    setPhone(value);
    if (error) setError('');
  };

  // טיפול בהתחברות
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // בדיקת תקינות מספר הטלפון
      if (!validatePhone(phone)) {
        throw new Error('נא להזין מספר טלפון תקין בפורמט: 05XXXXXXXX');
      }

      // בדיקה אם זה מנהל מערכת
      if (phone === ADMIN.phone) {
        console.log('Detected admin login');
        updateUserData(ADMIN);
        setCurrentScreen('admin');
        setIsLoading(false);
        return;
      }

      // בדיקת משתמש רגיל מול Firebase
      const userRef = doc(db, 'Users', phone);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        
        const userData = {
          phone,
          ...userDoc.data(),
          isAdmin: false,
          registeredLessons: userDoc.data().registeredLessons || [],
          completedLessons: userDoc.data().completedLessons || 0,
          membershipType: userDoc.data().membershipType || 'רגיל',
          joinDate: userDoc.data().joinDate || new Date().toISOString()
        };
        
        updateUserData(userData);
        setCurrentScreen('home');
      } else {
        throw new Error('מספר טלפון לא נמצא במערכת');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg">
        {/* כותרת ולוגו */}
        <div className="text-center">
          <div className="flex flex-col items-center mb-6">
            <img
              src={logoUrl}
              alt="Milan Pilates Logo"
              className="w-32 h-32 object-contain mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              Milan Pilates
            </h1>
            <span className="text-sm text-gray-500 mt-1">By Isakov Team</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            ברוכים הבאים
          </h2>
          <p className="mt-2 text-gray-600">
            התחברו כדי להירשם לשיעורים ולנהל את האימונים שלכם
          </p>
        </div>

        {/* טופס התחברות */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              מספר טלפון
            </label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-gray-400">📱</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                disabled={isLoading}
                className="w-full pr-10 p-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400 
                         outline-none transition-all disabled:opacity-50"
                placeholder="הזינו מספר טלפון"
                dir="ltr"
                maxLength={10}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              יש להזין מספר בפורמט: 05XXXXXXXX
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone}
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-500 
                     text-white rounded-lg font-medium transition-all
                     hover:from-blue-700 hover:to-blue-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-300
                     disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                מתחבר...
              </div>
            ) : (
              'התחברות'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;