import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useLogo } from '../contexts/LogoContext';
import moment from 'moment';
import { Line, Pie, Bar } from 'react-chartjs-2';
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
  Legend
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
  Legend
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
        const lessonDateTime = moment(`${lesson.date} ${lesson.time}`, 'YYYY-MM-DD HH:mm');
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
      const lastFourMonths = [...Array(4)].map((_, i) => 
        moment().subtract(i, 'months').format('MMMM')
      ).reverse();

      lastFourMonths.forEach(month => monthlyData[month] = 0);

      lessons.forEach(lesson => {
        const monthName = moment(lesson.date, 'YYYY-MM-DD').format('MMMM');
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName] += lesson.registeredParticipants || 0;
        }
      });

      setChartData({
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'הרשמות חודשיות',
          data: Object.values(monthlyData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }]
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
        datasets: [{
          label: 'סוגי מנויים',
          data: Object.values(membershipData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderWidth: 1
        }]
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
      const lastFourMonths = [...Array(4)].map((_, i) => 
        moment().subtract(i, 'months').format('MMMM')
      ).reverse();

      lastFourMonths.forEach(month => monthlyData[month] = 0);

      users.forEach(user => {
        const monthName = moment(user.joinDate, 'YYYY-MM-DD').format('MMMM');
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName]++;
        }
      });

      setBarChartData({
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'משתמשים חדשים',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
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
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {isMobile ? (
        <div className="flex flex-col h-full">
          <div className="bg-white p-4 shadow-md">
            <h1 className="text-lg font-bold text-center">ניהול מערכת</h1>
          </div>
        </div>
      ) : (
        <div className="flex h-screen bg-gray-100">
          {/* Desktop View */}
          <div className="w-64"> תפריט צד ותוכן נשמר. </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
