import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react"; // Changed from @testing-library/react to react
import "@testing-library/jest-dom";
import AdminDashboard from "../../pages/AdminDashboard";
import { useLogo } from "../../contexts/LogoContext.js";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(() =>
      Promise.resolve({
        docs: [
          {
            data: () => ({
              registeredParticipants: 5,
              date: "2025-01-31",
              isActive: true,
            }),
          },
        ],
      })
    ),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: jest.fn(() => true),
        data: jest.fn(() => ({ logoBase64: "test-logo" })),
      })
    ),
    setDoc: jest.fn(() => Promise.resolve()), // Mock Firestore writes
  }));
  


// ✅ Mock Logo Context & Chart.js
jest.mock("../../contexts/LogoContext", () => ({
  useLogo: jest.fn().mockReturnValue({ logoUrl: "test-logo-url" }),
}));
jest.mock("chart.js", () => ({
  Chart: jest.fn(),
}));

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // ✅ Mock Firestore collection & documents
    collection.mockReturnValue({});
    doc.mockReturnValue({});

    getDocs.mockResolvedValue({
      docs: [
        {
          data: () => ({
            registeredParticipants: 5,
            date: "2025-01-31",
            isActive: true,
          }),
        },
      ],
    });

    getDoc.mockResolvedValue({
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ logoBase64: "test-logo" })),
    });

    setDoc.mockResolvedValue(); // Mock setDoc with resolved Promise
  });

  test("renders dashboard with navigation", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(screen.getByText("ניהול מערכת")).toBeInTheDocument();
    expect(screen.getByText("לוח בקרה")).toBeInTheDocument();
  });

  test("switches between sections", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("ניהול משתמשים"));
    });

    expect(screen.getByText(/רשימת משתמשים/)).toBeInTheDocument();
  });

  test("displays statistics", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText("סטטיסטיקות מהירות")).toBeInTheDocument();
    });
  });

  test("handles logo upload", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });

    await act(async () => {
      render(<AdminDashboard />);
    });

    // ✅ Find file input correctly
    const input = screen.getByLabelText(/העלאת לוגו/);
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });
  });
  
});
