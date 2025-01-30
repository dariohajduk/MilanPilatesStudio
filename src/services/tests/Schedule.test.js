import React from "react";
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import Schedule from "../../pages/Schedule";
import { fetchLessons, updateLessonRegistration } from "../firebaseService";
import { useUser } from '../../contexts/UserContext';

jest.mock('../../contexts/UserContext');
jest.mock("../firebaseService", () => ({
  fetchLessons: jest.fn(),
  updateLessonRegistration: jest.fn()
}));

describe("Schedule Component", () => {
  beforeEach(() => {
    useUser.mockReturnValue({
      userData: {
        phone: "0547805845"
      }
    });
  });

  test("renders schedule page with heading", async () => {
    await act(async () => {
      render(<Schedule />);
    });
    expect(document.body.textContent).toContain('לוח שיעורים');
  });

  test("displays lessons fetched from Firebase", async () => {
    const mockLesson = {
      id: "lesson1",
      type: "Pilates",
      instructor: "John Doe",
      date: "2025-01-31",
      time: "10:00 AM",
      maxParticipants: 10,
      registeredParticipants: 5,
      waitingList: [],
      isActive: true
    };

    fetchLessons.mockResolvedValue([mockLesson]);

    await act(async () => {
      render(<Schedule />);
    });

    await waitFor(() => {
      expect(screen.getByText("Pilates עם John Doe")).toBeInTheDocument();
    });
  });

  test("allows user to register for a lesson", async () => {
    const mockLesson = {
      id: "lesson2",
      type: "Yoga",
      instructor: "Jane Doe",
      date: "2025-02-01",
      time: "08:00 AM",
      maxParticipants: 10,
      registeredParticipants: 2,
      waitingList: [],
      isActive: true
    };

    fetchLessons.mockResolvedValue([mockLesson]);
    updateLessonRegistration.mockResolvedValue({});

    await act(async () => {
      render(<Schedule />);
    });

    await waitFor(() => {
      expect(screen.getByText("Yoga עם Jane Doe")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("הירשם לשיעור"));
    });

    expect(updateLessonRegistration).toHaveBeenCalledWith(
      "lesson2",
      { phone: "0547805845" },
      true
    );
  });

  test("displays loading state", async () => {
    fetchLessons.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      render(<Schedule />);
    });
    
    expect(screen.getByText(/טוען/i)).toBeInTheDocument();
  });

  test("displays error message when fetching fails", async () => {
    fetchLessons.mockRejectedValue(new Error("Failed to fetch"));
    
    await act(async () => {
      render(<Schedule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/אירעה שגיאה בטעינת לוח השיעורים/i)).toBeInTheDocument();
    });
  });
});