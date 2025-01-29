if (typeof global.Blob === 'undefined') {
    global.Blob = require('blob-polyfill').Blob; // הוספת תמיכה ב-Blob
  }
  
  jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn((storage, path) => `${storage}:${path}`),
    uploadBytes: jest.fn().mockResolvedValue({}),
    getDownloadURL: jest.fn().mockResolvedValue('https://example.com/studio-logo.png'),
  }));
  
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})), // Mock פשוט
  }));
  jest.mock('react-big-calendar/lib/css/react-big-calendar.css', () => {});

  
  