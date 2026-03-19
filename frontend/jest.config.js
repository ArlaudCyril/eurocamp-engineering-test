module.exports = {
  displayName: 'frontend',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@client/(.*)$': '<rootDir>/../client/src/$1',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
};
