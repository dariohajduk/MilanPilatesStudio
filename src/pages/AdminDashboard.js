import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useLogo } from '../contexts/LogoContext';
import moment from 'moment';
import { Line, Pie, Bar } from 'react-chartjs-2';
import LessonManagement from './LessonManagement';
import UserManagement from './UserManagement';
import ManagerPage from './ManagerPage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Helper function to detect screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const AdminDashboard = ({ setCurrentScreen }) => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setLogoUrl } = useLogo();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    loadStats();
    loadChartData();
    loadPieChartData();
    loadBarChartData();
    fetchLogo();
  }, []);

  const loadStats = async () => {
    try {
      const lessonsSnapshot = await getDocs(collection(db, 'Lessons'));
      const lessons = lessonsSnapshot.docs.map((doc) => doc.data());

      const currentWeekStart = moment().startOf('week');
      const currentMonthStart = moment().startOf('month');

      let weeklyRegistrations = 0;
      let monthlyRegistrations = 0;
      let activeLessons = 0;

      lessons.forEach((lesson) => {
        const lessonDateTime = moment(
          `${lesson.date} ${lesson.time}`,
          'YYYY-MM-DD HH:mm',
        );
        if (lessonDateTime.isSameOrAfter(currentWeekStart)) {
          weeklyRegistrations += lesson.registeredParticipants || 0;
        }
        if (lessonDateTime.isSameOrAfter(currentMonthStart)) {
          monthlyRegistrations += lesson.registeredParticipants || 0;
        }
        if (lesson.isActive) {
          activeLessons++;
        }
      });

      setStats({
        activeLessons,
        weeklyRegistrations,
        monthlyRegistrations,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const lessonsSnapshot = await getDocs(collection(db, 'Lessons'));
      const lessons = lessonsSnapshot.docs.map((doc) => doc.data());

      const monthlyData = {};
      const lastFourMonths = [...Array(4)]
        .map((_, i) => moment().subtract(i, 'months').format('MMMM'))
        .reverse();

      lastFourMonths.forEach((month) => (monthlyData[month] = 0));

      lessons.forEach((lesson) => {
        const monthName = moment(lesson.date, 'YYYY-MM-DD').format('MMMM');
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName] += lesson.registeredParticipants || 0;
        }
      });

      setChartData({
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: 'הרשמות חודשיות',
            data: Object.values(monthlyData),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadPieChartData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const users = usersSnapshot.docs.map((doc) => doc.data());

      const membershipData = users.reduce((acc, user) => {
        const type = user.type || user.subscriptionType || user.membershipType;
        if (type) {
          acc[type] = (acc[type] || 0) + 1;
        }
        return acc;
      }, {});

      setPieChartData({
        labels: Object.keys(membershipData),
        datasets: [
          {
            label: 'סוגי מנויים',
            data: Object.values(membershipData),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error loading pie chart data:', error);
    }
  };

  const loadBarChartData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const users = usersSnapshot.docs.map((doc) => doc.data());

      const monthlyData = {};
      const lastFourMonths = [...Array(4)]
        .map((_, i) => moment().subtract(i, 'months').format('MMMM'))
        .reverse();

      lastFourMonths.forEach((month) => (monthlyData[month] = 0));

      users.forEach((user) => {
        const monthName = moment(user.joinDate, 'YYYY-MM-DD').format('MMMM');
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName]++;
        }
      });

      setBarChartData({
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: 'משתמשים חדשים',
            data: Object.values(monthlyData),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      });
    } catch (error) {
      console.error('Error loading bar chart data:', error);
    }
  };

  const fetchLogo = async () => {
    try {
      const settingsRef = doc(db, 'StudioInfo', 'Logo');
      const logoDoc = await getDoc(settingsRef);

      if (logoDoc.exists()) {
        setLogoUrl(logoDoc.data()?.logoBase64);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Logo = reader.result;
        const settingsRef = doc(db, 'StudioInfo', 'Logo');
        await setDoc(settingsRef, { logoBase64: base64Logo });

        setLogoUrl(base64Logo);
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
    { id: 'manager', label: 'ניהול מנהלים', icon: '⚙️' },
  ];
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">סטטיסטיקות מהירות</h2>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h- bg-gray-200 rounded"></div>
                    <div className="h-25 bg-gray-200 rounded"></div>
                    <div className="h-25 bg-gray-200 rounded"></div>
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
              <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <h2 className="text-xl font-bold mb-1">העלאת לוגו</h2>
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
                <h2 className="text-xl font-bold mb-2">מגמת הרשמות</h2>
                <div className="w-full">
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>
              </div>
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <h2 className="text-xl font-bold mb-1">התפלגות סוגי מנויים</h2>
                <div className="h-64 w-64 mx-auto">
                  {pieChartData && <Pie data={pieChartData} options={chartOptions} />}
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">משתמשים חדשים</h2>
                <div className="h-full w-full mx-auto">
                  {barChartData && <Bar data={barChartData} options={chartOptions} />}
                </div>
              </div>
             
              </div>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'lessons':
        return <LessonManagement />;
        case 'manager':
          return <ManagerPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar / Navigation */}
      <div className="bg-white shadow-lg md:w-1/4 w-full md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">ניהול מערכת</h1>
        </div>

        {isMobile ? (
          // Mobile Dropdown Menu
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center p-3 mx-auto w-full text-gray-600 bg-gray-50 rounded-lg shadow-md md:hidden"
            >
              תפריט
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-2 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute w-full bg-white shadow-lg z-10 rounded-lg">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsDropdownOpen(false); // Close dropdown on selection
                    }}
                    className={`flex items-center p-3 w-full text-left ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Desktop Menu
          <nav className="p-4 flex flex-col hidden md:block">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
