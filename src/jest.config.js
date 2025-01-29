module.exports = {
    transformIgnorePatterns: [  'node_modules/(?!(react-big-calendar|firebase|@firebase)/)',],
    //testEnvironment: 'node',
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': '../__mocks__/styleMock.js',
    },
    
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testEnvironment: 'jsdom', // הגדרת סביבת הבדיקה כ-jsdom



  };
  