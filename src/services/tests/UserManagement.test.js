import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import '@testing-library/jest-dom';
import UserManagement from "../../pages/UserManagement";
import { fetchUsers, addUser, editUser, deleteUser } from '../../services/firebaseService';

jest.mock('../../services/firebaseService', () => ({
  fetchUsers: jest.fn(),
  addUser: jest.fn(),
  editUser: jest.fn(),
  deleteUser: jest.fn()
}));

describe('UserManagement Component', () => {
  const mockUsers = [
    {
      id: "1",
      name: "Test User",
      phone: "0547805845",
      membership: "Basic"
    }
  ];

  beforeEach(() => {
    fetchUsers.mockResolvedValue(mockUsers);
  });

  test("renders user list", async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  test("adds new user", async () => {
    const newUser = {
      name: "New User",
      phone: "0501234567",
      membership: "Premium"
    };

    addUser.mockResolvedValue({ id: "2", ...newUser });

    await act(async () => {
      render(<UserManagement />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("הוסף משתמש"));
    });

    const nameInput = screen.getByPlaceholderText("שם מלא");
    const phoneInput = screen.getByPlaceholderText("טלפון");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: newUser.name } });
      fireEvent.change(phoneInput, { target: { value: newUser.phone } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("הוסף"));
    });

    await waitFor(() => {
      expect(addUser).toHaveBeenCalled();
    });
  });

  test("deletes user", async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    window.confirm = jest.fn(() => true);

    await act(async () => {
      fireEvent.click(screen.getByText("מחק"));
    });

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });
  });
});