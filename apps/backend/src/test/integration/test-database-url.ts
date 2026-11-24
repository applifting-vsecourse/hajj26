/**
 * Integration tests never touch the development database: they use
 * TEST_DATABASE_URL, or DATABASE_URL with `_test` appended to the database
 * name (quacker → quacker_test), on the same Postgres server.
 */
export function testDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL or TEST_DATABASE_URL (see .env)');
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `${url.pathname.replace(/_test$/, '')}_test`;
  return url.toString();
}

/** A last line of defence before tests wipe tables. */
export function assertIsTestDatabase(databaseUrl: string): void {
  const name = new URL(databaseUrl).pathname.slice(1);
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests against "${name}": the database name must end with _test`,
    );
  }
}
