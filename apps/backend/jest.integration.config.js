// Integration tests: the real app over HTTP against a real (test) database.
// Run with `pnpm backend test:int`; needs Postgres (docker-compose locally,
// a service container in CI). The app runs as its own process and the tests
// reach it over HTTP with supertest — see src/test/integration/global-setup.ts.
const base = require('./package.json').jest;

module.exports = {
  ...base,
  testRegex: '\\.int-spec\\.ts$',
  globalSetup: '<rootDir>/src/test/integration/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/integration/global-teardown.ts',
  setupFiles: ['<rootDir>/src/test/integration/setup-env.ts'],
  testTimeout: 20000,
};
