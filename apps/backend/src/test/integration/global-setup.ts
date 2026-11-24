import 'dotenv/config';
import { ChildProcess, execSync, spawn } from 'node:child_process';
import { createWriteStream, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertIsTestDatabase, testDatabaseUrl } from './test-database-url';

declare global {
  var __INTEGRATION_APP__: ChildProcess | undefined;
}

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() =>
        typeof address === 'object' && address
          ? resolve(address.port)
          : reject(new Error('No free port')),
      );
    });
  });

const waitForApp = async (url: string, logFile: string): Promise<void> => {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`The app did not start within 60 s — see ${logFile}`);
};

/**
 * Migrates the test database, then starts the backend — main.ts itself, so
 * the tests go through exactly the pipeline production uses — on a free port.
 * The app runs as its own Node process because better-auth is ESM-only and
 * Jest's module system cannot load it.
 */
export default async function globalSetup(): Promise<void> {
  const databaseUrl = testDatabaseUrl();
  assertIsTestDatabase(databaseUrl);
  execSync('pnpm exec prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const logFile = join(mkdtempSync(join(tmpdir(), 'quacker-int-')), 'app.log');
  const log = createWriteStream(logFile);

  const app = spawn(
    process.execPath,
    [
      '-r',
      'ts-node/register/transpile-only',
      '-r',
      'tsconfig-paths/register',
      'src/main.ts',
    ],
    {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        PORT: String(port),
        BACKEND_URL: baseUrl,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  app.stdout?.pipe(log);
  app.stderr?.pipe(log);
  globalThis.__INTEGRATION_APP__ = app;

  await waitForApp(`${baseUrl}/api/docs`, logFile);
  // Read by the tests (see test-api.ts).
  process.env.INTEGRATION_BASE_URL = baseUrl;
  process.env.INTEGRATION_APP_LOG = logFile;
}
