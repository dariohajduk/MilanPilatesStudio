import { statsService } from './statsService';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Mock Firebase Firestore methods
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe('statsService Tests', () => {
  let originalConsoleError;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn(); // עוקף את console.error
  });

  afterEach(() => {
    console.error = originalConsoleError; // משחזר את הפונקציה המקורית
    jest.clearAllMocks();
  });

  test('should return correct quick stats', async () => {
    getDocs
      .mockResolvedValueOnce({ size: 10 }) // Active users
      .mockResolvedValueOnce({ size: 5 }) // Active lessons
      .mockResolvedValueOnce({
        docs: [
          { data: () => ({ registeredParticipants: 20 }) },
          { data: () => ({ registeredParticipants: 15 }) },
        ],
      }) // Weekly registrations
      .mockResolvedValueOnce({
        docs: [
          { data: () => ({ registeredParticipants: 50 }) },
          { data: () => ({ registeredParticipants: 30 }) },
        ],
      }); // Monthly registrations

    const result = await statsService.getQuickStats();

    expect(result).toEqual({
      activeUsers: 10,
      activeLessons: 5,
      weeklyRegistrations: 35,
      monthlyRegistrations: 80,
    });

    expect(getDocs).toHaveBeenCalledTimes(4);
  });

  test('should throw an error if fetching active users fails', async () => {
    const errorMessage = 'Failed to fetch active users';
    getDocs.mockRejectedValueOnce(new Error(errorMessage));

    await expect(statsService.getQuickStats()).rejects.toThrow(errorMessage);

    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  test('should throw an error if fetching weekly registrations fails', async () => {
    getDocs
      .mockResolvedValueOnce({ size: 10 }) // Active users
      .mockResolvedValueOnce({ size: 5 }) // Active lessons
      .mockRejectedValueOnce(new Error('Failed to fetch weekly registrations')); // Weekly registrations fail

    await expect(statsService.getQuickStats()).rejects.toThrow(
      'Failed to fetch weekly registrations'
    );

    expect(getDocs).toHaveBeenCalledTimes(3);
  });

  test('should handle partial failures gracefully', async () => {
    getDocs
      .mockResolvedValueOnce({ size: 10 }) // Active users
      .mockResolvedValueOnce({ size: 5 }) // Active lessons
      .mockResolvedValueOnce({
        docs: [
          { data: () => ({ registeredParticipants: 20 }) },
          { data: () => ({ registeredParticipants: 15 }) },
        ],
      }) // Weekly registrations
      .mockRejectedValueOnce(new Error('Failed to fetch monthly registrations')); // Monthly registrations fail

    try {
      await statsService.getQuickStats();
    } catch (error) {
      expect(error.message).toContain('Failed to fetch monthly registrations');
    }

    expect(getDocs).toHaveBeenCalledTimes(4);
  });
});
