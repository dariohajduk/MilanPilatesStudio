import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import '@testing-library/jest-dom';
import ManagerPage from "../../pages/ManagerPage";
import { fetchCollection, addDocument, deleteDocument } from '../../services/firebaseService';

jest.mock('../../services/firebaseService', () => ({
  fetchCollection: jest.fn(),
  addDocument: jest.fn(),
  deleteDocument: jest.fn()
}));

describe('ManagerPage Component', () => {
  const mockLessonTypes = [
    { id: "1", name: "Pilates" },
    { id: "2", name: "Yoga" }
  ];

  beforeEach(() => {
    fetchCollection.mockResolvedValue(mockLessonTypes);
  });

  test("renders lesson types and memberships", async () => {
    await act(async () => {
      render(<ManagerPage />);
    });

    expect(screen.getByText("ניהול סוגי שיעורים ומנויים")).toBeInTheDocument();
  });

  test("adds new lesson type", async () => {
    const newType = { id: "3", name: "Zumba" };
    addDocument.mockResolvedValue(newType);

    await act(async () => {
      render(<ManagerPage />);
    });

    const input = screen.getByPlaceholderText("הוסף סוג שיעור חדש");

    await act(async () => {
      fireEvent.change(input, { target: { value: newType.name } });
      fireEvent.click(screen.getByText("הוסף סוג שיעור"));
    });

    await waitFor(() => {
      expect(addDocument).toHaveBeenCalled();
    });
  });

  test("handles errors when adding lesson type", async () => {
    addDocument.mockRejectedValue(new Error("Failed to add"));

    await act(async () => {
      render(<ManagerPage />);
    });

    const input = screen.getByPlaceholderText("הוסף סוג שיעור חדש");

    await act(async () => {
      fireEvent.change(input, { target: { value: "New Type" } });
      fireEvent.click(screen.getByText("הוסף סוג שיעור"));
    });

    await waitFor(() => {
      expect(screen.getByText(/אירעה שגיאה/)).toBeInTheDocument();
    });
  });
});