import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserManagement from "../../pages/UserManagement";
import { fetchUsers, addUser, editUser, deleteUser } from '../services/firebaseService';
import { useUser } from '../contexts/UserContext';

// Mock the firebaseService functions
jest.mock('../../services/firebaseService', () => ({
  fetchUsers: jest.fn(),
  addUser: jest.fn(),
  editUser: jest.fn(),
  deleteUser: jest.fn()
}));

// Mock UserContext
jest.mock('../../contexts/UserContext', () => ({
  useUser: jest.fn()
}));

describe('UserManagement Component', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'Test User',
      phone: '0547805845',
      membership: 'Basic',
      remainingLessons: 10
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    fetchUsers.mockResolvedValue(mockUsers);
    addUser.mockResolvedValue({ id: '2' });
    editUser.mockResolvedValue();
    deleteUser.mockResolvedValue();

    // Mock UserContext
    useUser.mockReturnValue({
      refreshUserData: jest.fn()
    });
  });

  test('renders user list', async () => {
    await 
      render(<UserManagement />);
    

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(fetchUsers).toHaveBeenCalled();
  });

  test('adds new user', async () => {
    const newUser = {
      name: 'New User',
      phone: '0501234567',
      membership: 'כרטיסייה'
    };

    await 
      render(<UserManagement />);
    

    // Click add user button
    const addButton = screen.getByText('הוסף משתמש');
    await 
      fireEvent.click(addButton);
   

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('שם מלא');
    const phoneInput = screen.getByPlaceholderText('טלפון');
    const membershipSelect = screen.getByRole('combobox');

    await
      fireEvent.change(nameInput, { target: { value: newUser.name } });
      fireEvent.change(phoneInput, { target: { value: newUser.phone } });
      fireEvent.change(membershipSelect, { target: { value: newUser.membership } });
  

    // Submit the form
    const submitButton = screen.getByText('הוסף');
    await 
      fireEvent.click(submitButton);
   

    await waitFor(() => {
      expect(addUser).toHaveBeenCalledWith({
        name: newUser.name,
        phone: newUser.phone,
        membership: newUser.membership,
        remainingLessons: 0,
        registeredLessons: [],
        completedLessons: 0,
        joinDate: expect.any(String)
      });
    });
  });

  test('deletes user', async () => {
    await 
      render(<UserManagement />);
  

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    // Find and click delete button
    const deleteButton = screen.getByText('מחק');
    await 
      fireEvent.click(deleteButton);
  

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith('1');
    });

    // Cleanup
    mockConfirm.mockRestore();
  });

  test('shows error when adding user with missing fields', async () => {
    await
      render(<UserManagement />);
   

    // Click add user button
    const addButton = screen.getByText('הוסף משתמש');
    await 
      fireEvent.click(addButton);
   

    // Try to submit without filling fields
    const submitButton = screen.getByText('הוסף');
    await 
      fireEvent.click(submitButton);
 

    expect(screen.getByText('אנא מלא את כל השדות החובה')).toBeInTheDocument();
  });

  test('handles error when fetching users fails', async () => {
    fetchUsers.mockRejectedValue(new Error('Failed to fetch users'));

    await 
      render(<UserManagement />);
    

    await waitFor(() => {
      expect(screen.getByText(/שגיאה בטעינת המשתמשים/i)).toBeInTheDocument();
    });
  });
});