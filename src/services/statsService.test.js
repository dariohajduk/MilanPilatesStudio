import { statsService } from './statsService';
import { collection, query, where, getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe('statsService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // לוודא שהמצב של ה-Mocks מתאפס לפני כל בדיקה
  });

  test('should return correct stats', async () => {
    // Mock עבור משתמשים פעילים
    getDocs.mockResolvedValueOnce({ size: 10 }); // קריאה ראשונה
    getDocs.mockResolvedValueOnce({ size: 5 }); // קריאה שנייה
    getDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ registeredParticipants: 20 }) },
        { data: () => ({ registeredParticipants: 15 }) },
      ],
    }); // קריאה שלישית
    getDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ registeredParticipants: 50 }) },
        { data: () => ({ registeredParticipants: 30 }) },
      ],
    }); // קריאה רביעית

    const result = await statsService.getQuickStats();

    expect(result).toEqual({
      activeUsers: 10,
      activeLessons: 5,
      weeklyRegistrations: 35,
      monthlyRegistrations: 80,
    });

    // לוודא שהפונקציה getDocs נקראה 4 פעמים בלבד
    expect(getDocs).toHaveBeenCalledTimes(4);
  });

  test('should throw an error if fetching stats fails', async () => {
    const errorMessage = 'Failed to fetch stats';
    getDocs.mockRejectedValueOnce(new Error(errorMessage)); // קריאה ראשונה נכשלת

    await expect(statsService.getQuickStats()).rejects.toThrow(errorMessage);

    // לוודא שהפונקציה getDocs נקראה פעם אחת בלבד
    expect(getDocs).toHaveBeenCalledTimes(1);
  });
});
