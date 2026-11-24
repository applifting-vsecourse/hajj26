import 'dotenv/config';
import { assertIsTestDatabase, testDatabaseUrl } from './test-database-url';

// Runs before each test file, before the app is imported: point Prisma at the
// test database instead of the development one.
process.env.DATABASE_URL = testDatabaseUrl();
assertIsTestDatabase(process.env.DATABASE_URL);
