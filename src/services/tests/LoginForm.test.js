import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import '@testing-library/jest-dom';
import LoginForm from "../../pages/LoginForm";
import { useUser } from '../../contexts/UserContext';
import { useLogo } from '../../contexts/LogoContext';
import { getDoc } from 'firebase/firestore';

// Mock all required dependencies
jest.mock('../../contexts/UserContext');
jest.mock('../../contexts/LogoContext');
jest.mock('firebase/firestore');
jest.mock('../../firebase', () => ({
  db: {}
}));

describe('LoginForm Component', () => {
  const mockSetCurrentScreen = jest.fn();
  const mockUpdateUserData = jest.fn();

  beforeEach(() => {
    useUser.mockReturnValue({ updateUserData: mockUpdateUserData });
    useLogo.mockReturnValue({ logoUrl: 'test-logo-url' });
  });

  test("renders login form", async () => {
    await act(async () => {
      render(<LoginForm setCurrentScreen={mockSetCurrentScreen} />);
    });

    expect(screen.getByText("ברוכים הבאים")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("הזינו מספר טלפון")).toBeInTheDocument();
  });

  test("handles admin login", async () => {
    await act(async () => {
      render(<LoginForm setCurrentScreen={mockSetCurrentScreen} />);
    });

    const phoneInput = screen.getByPlaceholderText("הזינו מספר טלפון");

    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: "0500000000" } });
      fireEvent.click(screen.getByText("התחברות"));
    });

    expect(mockSetCurrentScreen).toHaveBeenCalledWith('admin');
  });

  test("handles regular user login", async () => {
    const mockUserData = {
      exists: () => true,
      data: () => ({
        name: "Test User",
        membershipType: "Basic"
      })
    };

    getDoc.mockResolvedValue(mockUserData);

    await act(async () => {
      render(<LoginForm setCurrentScreen={mockSetCurrentScreen} />);
    });

    const phoneInput = screen.getByPlaceholderText("הזינו מספר טלפון");

    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: "0501234567" } });
      fireEvent.click(screen.getByText("התחברות"));
    });

    await waitFor(() => {
      expect(mockSetCurrentScreen).toHaveBeenCalledWith('home');
    });
  });

  test("handles invalid phone number", async () => {
    await act(async () => {
      render(<LoginForm setCurrentScreen={mockSetCurrentScreen} />);
    });

    const phoneInput = screen.getByPlaceholderText("הזינו מספר טלפון");

    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: "123" } });
      fireEvent.click(screen.getByText("התחברות"));
    });

    expect(screen.getByText(/נא להזין מספר טלפון תקין/)).toBeInTheDocument();
  });
});