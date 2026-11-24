// The quack feed over HTTP, against the real backend and a test database
// (see src/test/integration). Each test starts from empty tables.
import { connectTestApi, TestApi } from '@/test/integration/test-api';

describe('GET /api/quacks (integration)', () => {
  let testApi: TestApi;

  beforeAll(() => {
    testApi = connectTestApi();
  });

  afterAll(async () => {
    await testApi.close();
  });

  beforeEach(async () => {
    await testApi.reset();
  });

  it('turns a signed-out visitor away with 401', async () => {
    const { status } = await testApi.anonymous.get('/quacks');

    expect(status).toBe(401);
  });

  it('shows a signed-in user the feed with 200', async () => {
    const duck = await testApi.signUp('Duck');
    expect((await duck.post('/quacks', { text: 'first!' })).status).toBe(201);

    const { status, body } = await duck.get('/quacks');

    expect(status).toBe(200);
    expect(body).toEqual([
      expect.objectContaining({ text: 'first!', userId: duck.userId }),
    ]);
  });
});
