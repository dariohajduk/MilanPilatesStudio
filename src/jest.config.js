// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleDirectories: ['node_modules', 'src']
};