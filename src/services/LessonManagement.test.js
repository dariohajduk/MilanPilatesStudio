import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { LessonsProvider } from '../contexts/LessonsContext'; // Assuming you have this context wrapper
import LessonManagement from '../pages/LessonManagement.js';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'newLessonId' })),
}));

jest.mock('../firebase', () => ({
  db: {},
}));

describe('LessonManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with default state', async () => {
    render(
      <LessonsProvider>
        <LessonManagement />
      </LessonsProvider>
    );

    expect(screen.getByText('ניהול שיעורים')).toBeInTheDocument();
    expect(screen.getByText('הצג היסטוריית שיעורים')).toBeInTheDocument();
    expect(screen.queryByText('הוסף שיעור')).toBeNull();
  });

  test('toggles between history and future lessons', () => {
    render(
      <LessonsProvider>
        <LessonManagement />
      </LessonsProvider>
    );

    const toggleButton = screen.getByText('הצג היסטוריית שיעורים');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('הצג שיעורים עתידיים')).toBeInTheDocument();
  });

  test('opens the add lesson form', () => {
    render(
      <LessonsProvider>
        <LessonManagement />
      </LessonsProvider>
    );

    const addLessonButton = screen.getByText('הגדר שיעור');
    fireEvent.click(addLessonButton);

    expect(screen.getByPlaceholderText('שם המדריך')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('מספר משתתפים מקסימלי')).toBeInTheDocument();
  });

  test('validates form inputs before adding a lesson', async () => {
    render(
      <LessonsProvider>
        <LessonManagement />
      </LessonsProvider>
    );

    const addLessonButton = screen.getByText('הגדר שיעור');
    fireEvent.click(addLessonButton);

    const submitButton = screen.getByText('הוסף שיעור');
    fireEvent.click(submitButton);

    expect(screen.getByText('אנא מלא את כל השדות בטופס')).toBeInTheDocument();
  });

  test('adds a lesson successfully', async () => {
    render(
      <LessonsProvider>
        <LessonManagement />
      </LessonsProvider>
    );

    const addLessonButton = screen.getByText('הגדר שיעור');
    fireEvent.click(addLessonButton);

    const instructorInput = screen.getByPlaceholderText('שם המדריך');
    const participantsInput = screen.getByPlaceholderText('מספר משתתפים מקסימלי');
    const dateInput = screen.getByPlaceholderText('תאריך השיעור');
    const timeInput = screen.getByPlaceholderText('שעת השיעור');
    const submitButton = screen.getByText('הוסף שיעור');

    fireEvent.change(instructorInput, { target: { value: 'John Doe' } });
    fireEvent.change(participantsInput, { target: { value: 10 } });
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(timeInput, { target: { value: '10:00' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.queryByPlaceholderText('שם המדריך')).toBeNull();
    expect(screen.getByText('הוסף שיעור')).not.toBeInTheDocument();
  });

  test('renders lessons in the calendar', () => {
    const mockLessons = [
      {
        id: '1',
        type: 'Pilates',
        instructor: 'John Doe',
        date: '2025-01-01',
        time: '10:00',
        maxParticipants: 10,
        isActive: true,
      },
    ];

    render(
      <LessonsProvider initialLessons={mockLessons}>
        <LessonManagement />
      </LessonsProvider>
    );

    expect(screen.getByText('Pilates - John Doe')).toBeInTheDocument();
  });

  test('deletes a lesson when delete button is clicked', async () => {
    const mockLessons = [
      {
        id: '1',
        type: 'Pilates',
        instructor: 'John Doe',
        date: '2025-01-01',
        time: '10:00',
        maxParticipants: 10,
        isActive: true,
      },
    ];

    render(
      <LessonsProvider initialLessons={mockLessons}>
        <LessonManagement />
      </LessonsProvider>
    );

    const deleteButton = screen.getByText('מחק');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(screen.queryByText('Pilates - John Doe')).toBeNull();
  });
});
