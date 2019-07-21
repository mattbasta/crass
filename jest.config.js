module.exports = {
  verbose: true,
  testMatch: [
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
