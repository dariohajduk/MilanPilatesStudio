// src/services/statsService.js
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const statsService = {
  // קבלת סטטיסטיקות מהירות
  async getQuickStats() {
    try {
      // מספר משתמשים פעילים
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const activeUsers = usersSnapshot.size;

      // תאריך לפני שבוע
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // תאריך לפני חודש
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // שיעורים פעילים
      const activeLessonsQuery = query(
        collection(db, 'Lessons'),
        where('isActive', '==', true)
      );
      const activeLessonsSnapshot = await getDocs(activeLessonsQuery);
      const activeLessons = activeLessonsSnapshot.size;

      // נרשמים השבוע
      const weeklyRegistrationsQuery = query(
        collection(db, 'Lessons'),
        where('date', '>=', weekAgo)
      );
      const weeklyLessons = await getDocs(weeklyRegistrationsQuery);
      const weeklyRegistrations = weeklyLessons.docs.reduce(
        (sum, doc) => sum + (doc.data().registeredParticipants || 0), 
        0
      );

      // נרשמים החודש
      const monthlyRegistrationsQuery = query(
        collection(db, 'Lessons'),
        where('date', '>=', monthAgo)
      );
      const monthlyLessons = await getDocs(monthlyRegistrationsQuery);
      const monthlyRegistrations = monthlyLessons.docs.reduce(
        (sum, doc) => sum + (doc.data().registeredParticipants || 0), 
        0
      );

      return {
        activeUsers,
        activeLessons,
        weeklyRegistrations,
        monthlyRegistrations
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};
