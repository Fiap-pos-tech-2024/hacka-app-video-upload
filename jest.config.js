module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@adapter/(.*)$': '<rootDir>/src/adapter/$1',
    },
}