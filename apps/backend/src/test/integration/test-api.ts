import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ApiClient } from './api-client';

export type TestApi = {
  /** A client without a session — an anonymous visitor. */
  anonymous: ApiClient;
  /** Signs up a fresh user and returns a client carrying their session. */
  signUp: (name: string) => Promise<ApiClient>;
  /** Empties every table, so each test starts from nothing. */
  reset: () => Promise<void>;
  close: () => Promise<void>;
};

/**
 * Talks to the backend started by global-setup.ts over HTTP, and to the test
 * database directly only to wipe it between tests.
 */
export function connectTestApi(): TestApi {
  const baseUrl = process.env.INTEGRATION_BASE_URL;
  if (!baseUrl) {
    throw new Error('Run integration tests with `pnpm backend test:int`');
  }
  // setup-env.ts has already pointed DATABASE_URL at the test database.
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  let userCount = 0;

  return {
    anonymous: new ApiClient(baseUrl),
    signUp: async (name: string): Promise<ApiClient> => {
      userCount += 1;
      const username = `${name.toLowerCase()}_${userCount}`;
      return ApiClient.signUp(baseUrl, {
        name,
        username,
        email: `${username}@example.test`,
        password: 'quack-quack-123',
      });
    },
    reset: async (): Promise<void> => {
      await prisma.$executeRawUnsafe(
        'TRUNCATE TABLE "user", "session", "account", "verification" CASCADE',
      );
    },
    close: (): Promise<void> => prisma.$disconnect(),
  };
}
