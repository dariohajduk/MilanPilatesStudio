import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useLogo } from '../contexts/LogoContext';
import moment from 'moment';


const AdminDashboard = ({ setCurrentScreen }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setLogoUrl } = useLogo();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const lessonsSnapshot = await getDocs(collection(db, 'Lessons'));
      const lessons = lessonsSnapshot.docs.map((doc) => doc.data());

      const currentWeekStart = moment().startOf('week');
      const currentMonthStart = moment().startOf('month');

      let weeklyRegistrations = 0;
      let monthlyRegistrations = 0;

      lessons.forEach((lesson) => {
        const lessonDate = moment(`${lesson.date} ${lesson.time}`, 'YYYY-MM-DD HH:mm');
        if (lessonDate.isSameOrAfter(currentWeekStart)) {
          weeklyRegistrations += lesson.registeredParticipants || 0;
        }
        if (lessonDate.isSameOrAfter(currentMonthStart)) {
          monthlyRegistrations += lesson.registeredParticipants || 0;
        }
      });

      setStats({
        activeLessons: lessons.length,
        weeklyRegistrations,
        monthlyRegistrations,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const settingsRef = doc(db, 'StudioInfo', 'Logo');
      const logoDoc = await getDoc(settingsRef);

      if (logoDoc.exists()) {
        setLogoUrl(logoDoc.data()?.logoBase64); // Load the logo from Firestore
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Convert the image to a base64 string
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Logo = reader.result;

        // Store the base64 string in Firestore
        const settingsRef = doc(db, 'StudioInfo', 'Logo');
        await setDoc(settingsRef, { logoBase64: base64Logo });

        setLogoUrl(base64Logo); // Update the local state
        alert('לוגו הועלה ונשמר בהצלחה');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('אירעה שגיאה בהעלאת הלוגו');
    }
  };

  

  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: '📊' },
    { id: 'users', label: 'ניהול משתמשים', icon: '👥' },
    { id: 'lessons', label: 'ניהול שיעורים', icon: '📅' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">ניהול מערכת</h1>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id !== 'dashboard') {
                  setCurrentScreen(item.id);
                }
              }}
              className={`w-full flex items-center p-3 mb-2 rounded-lg transition-colors
                ${activeSection === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">לוח בקרה</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">סטטיסטיקות מהירות</h2>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">שיעורים פעילים</span>
                      <span className="font-semibold">{stats?.activeLessons || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">נרשמים השבוע</span>
                      <span className="font-semibold">{stats?.weeklyRegistrations || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">נרשמים החודש</span>
                      <span className="font-semibold">{stats?.monthlyRegistrations || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">העלאת לוגו</h2>
                <div className="space-y-4">
                  <input
                    type="file"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
