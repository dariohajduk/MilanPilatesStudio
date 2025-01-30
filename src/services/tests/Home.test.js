import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from 'react'; // Changed from @testing-library/react to react
import '@testing-library/jest-dom';
import Home from "../../pages/Home";
import { useUser } from '../../contexts/UserContext';
import { useLogo } from '../../contexts/LogoContext';

// Mock the contexts
jest.mock('../../contexts/UserContext');
jest.mock('../../contexts/LogoContext');

describe('Home Component', () => {
  // Mock data
  const mockUserData = {
    name: "Test User",
    membershipType: "Basic",
    registeredLessons: [
      {
        id: "1",
        title: "Test Lesson",
        type: "Pilates",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        instructor: "Test Instructor"
      }
    ],
    completedLessons: 5,
    joinDate: "2024-01-01"
  };

  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    useUser.mockReturnValue({
      userData: mockUserData
    });

    useLogo.mockReturnValue({
      logoUrl: 'test-logo-url'
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test("renders user welcome message", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText(/ברוכים הבאים/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockUserData.name))).toBeInTheDocument();
  });

  test("displays studio logo", async () => {
    await act(async () => {
      render(<Home />);
    });

    const logo = screen.getByAltText('Studio Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'test-logo-url');
  });

  test("displays upcoming lessons section", async () => {
    await act(async () => {
      render(<Home />);
    });

    const upcomingLessons = screen.getByText('השיעורים הקרובים שלך');
    expect(upcomingLessons).toBeInTheDocument();
  });

  test("displays statistics section", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument();
    expect(screen.getByText(/שיעורים שהשתתפת/)).toBeInTheDocument();
  });

  test("displays membership details section", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText('פרטי מנוי')).toBeInTheDocument();
    expect(screen.getByText(/סוג מנוי/)).toBeInTheDocument();
    expect(screen.getByText(/תאריך הצטרפות/)).toBeInTheDocument();
  });

  test("handles case with no upcoming lessons", async () => {
    useUser.mockReturnValue({
      userData: {
        ...mockUserData,
        registeredLessons: []
      }
    });

    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText(/אין שיעורים קרובים השבוע/)).toBeInTheDocument();
  });

  test("calculates statistics correctly", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText(new RegExp(mockUserData.completedLessons.toString()))).toBeInTheDocument();
  });
});