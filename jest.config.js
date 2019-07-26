module.exports = {
  verbose: true,
  testMatch: [
    '**/src/**.test.ts',
    '**/src/*/**.test.ts',
    '**/test/**.ts',
    '**/test/**.js',
    '**/test/**/*.ts',
    '**/test/**/*.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '_helpers.ts',
  ],
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.preprocessor.js',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
