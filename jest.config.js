module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main/**',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/infra/db/typeorm/migrations/**',
    '!<rootDir>/src/infra/db/typeorm/data-source.ts',
    '<rootDir>/src/infra/db/typeorm/typeorm-helper.ts',
    '<rootDir>/src/infra/db/typeorm/entities/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.node.json'
    }]
  },
  moduleNameMapper: {
    '@/tests/(.*)': '<rootDir>/tests/$1',
    '@/(.*)': '<rootDir>/src/$1'
  }
}
