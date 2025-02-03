const path = require('path');

/** @type {import('jest').Config} */
const config = {
  verbose: true,
  rootDir: path.resolve(__dirname),  // מבטיח שה-Jest יפעל משורש הפרויקט
  testEnvironment: 'jsdom',  // מאפשר בדיקות React בסביבת דפדפן מדומה
  
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // קובץ הכנות לבדיקה
  
  moduleNameMapper: {
    // טיפול בקבצי CSS / SCSS / LESS כדי למנוע שגיאות
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // טיפול בייבוא תמונות וסרטונים (ממיר אותם ל-`mock`)
    "\\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",

    // מפות נתיבים מותאמות אישית
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@pages/(.*)$": "<rootDir>/pages/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
  },

  // טיפול בקבצי JavaScript ו-TypeScript
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },

  // מונע התעלמות מהתלויות החשובות (Firebase, Chart.js וכו')
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase|chart.js|react-big-calendar)/)'
  ],

  // הגדרת סיומות קבצים שנתמכים
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],

  // מציאת קבצי הבדיקות
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)", 
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  // התעלמות מקבצי node_modules
  testPathIgnorePatterns: ['/node_modules/'],

  // קביעת סביבת עבודה מדומה ל-React
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};

module.exports = config;
