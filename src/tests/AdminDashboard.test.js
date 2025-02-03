import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminDashboard from "../../pages/AdminDashboard";

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  Calendar: () => null,
  momentLocalizer: () => null
}));

// Mock CSS import
jest.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}));

// Rest of your mocks...
jest.mock('../../firebase', () => ({
  db: {}
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [
      {
        data: () => ({
          registeredParticipants: 5,
          date: "2025-01-31",
          isActive: true
        })
      }
    ]
  })),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ logoBase64: "test-logo" })
  })),
  setDoc: jest.fn(() => Promise.resolve())
}));

// Mock LogoContext
jest.mock('../../contexts/LogoContext', () => ({
  useLogo: () => ({
    logoUrl: 'test-logo-url',
    setLogoUrl: jest.fn()
  })
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn()
}));

// Mock moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return moment;
});

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic dashboard elements", async () => {
    await 
      render(<AdminDashboard />);

    expect(screen.getByText(/ניהול מערכת/i)).toBeInTheDocument();
  });

  test("can navigate to different sections", async () => {
    await 
      render(<AdminDashboard />);

    const usersNav = screen.getByText(/ניהול משתמשים/i);
    await 
      fireEvent.click(usersNav);

    expect(screen.getByText(/רשימת משתמשים/i)).toBeInTheDocument();
  });
});